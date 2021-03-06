const {request, response} = require('express');

const userConnected = require('../helpers/userConnected');
const albumExists = require('../helpers/validateAlbum');
const { removeOldImage } = require('../helpers/uploadImage');

const AlbumSchema = require('../models/albumSchema');
const PhotoSchema = require('../models/photoSchema');
const UserSchema = require('../models/userSchema');
const LikeSchema = require('../models/likeSchema');

const viewPhotos = async(req = request, res = response) =>
{
    const { user_name, album } = req.params;
    const { _id: uid_user } = await UserSchema.findOne({user_name});

    // Compruebo que exista el álbum del usuario
    if (!await albumExists(uid_user, album))
    {
        return res.status(401).json({
            message: 'El álbum no existe'
        });
    }

    const { _id: uid_album } = await AlbumSchema.findOne({uid_user, name: album});
    const photos = await PhotoSchema.find({ uid_album });

    res.json({
        photos
    });
}

// Función para buscar solo una imagen
const viewPhoto = async(req = request, res = response) =>
{
    const { photo: image } = req.params;
    const photo = await PhotoSchema.findOne({image});

    if (!photo)
    {
        return res.status(401).json({
            message: 'No existe la imagen'
        });
    }

    res.json({
        photo
    });
}

const addPhoto = async(req = request, res = response) =>
{
    // Compruebo si el usuario está conectado
    userConnected(req, res);

    const {_id: uid_user, is_admin} = req.user_connected;

    if (is_admin)
    {
        return res.status(401).json({
            message: 'Los administradores no pueden tener álbumes'
        });
    }

    const { album } = req.params;

    // Compruebo que exista el álbum del usuario
    if (!await albumExists(uid_user, album))
    {
        return res.status(401).json({
            message: 'El álbum no existe'
        });
    }

    const {title, description, image, location} = req.body;
    
    const { _id: uid_album } = await AlbumSchema.findOne({uid_user, name: album});

    const photo = new PhotoSchema({uid_album, title, description, image, location});
    await photo.save();

    res.status(201).json({
        message: 'Fotografía añadida',
        photo
    });
}

const editPhoto = async(req = request, res = response) =>
{
    const { uid } = req.params;
    const { title, description } = req.body;

    const photo = await PhotoSchema.findByIdAndUpdate(uid, {title, description}, {new: true});
    
    res.json({
        message: 'Fotografía editada',
        photo
    });
}

const deletePhoto = async(req = request, res = response) =>
{
    const { uid } = req.params;
    const user = req.user_connected;
    const { image } = req.body;

    // Elimino la fotografía de la API
    removeOldImage('photo', user, image);

    const photo = await PhotoSchema.findByIdAndDelete(uid);

    // Elimino la fotografía de la colección de likes
    await LikeSchema.deleteMany({uid_photo: uid});

    res.json({
        message: 'Fotografía eliminada',
        photo
    });
}

module.exports =
{
    viewPhotos,
    viewPhoto,
    addPhoto,
    editPhoto,
    deletePhoto
}