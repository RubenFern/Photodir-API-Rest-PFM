const {Schema, model} = require('mongoose');

const PhotoSchema = Schema
({
    uid_album: 
    {
        type: Schema.Types.ObjectId,
        ref: 'Album',
        required: [true, 'La fotografía debe pertenecer a un álbum']
    },

    title:
    {
        type: String,
    },

    description: 
    {
        type: String,
    },

    image:
    {
        type: String,
        required: [true, 'Debes subir una fotografía']
    },

    location:
    {
        type: String
    },

    creation_date:
    {
        type: String,
        default: () =>
        {
            const date = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

            return date.toLocaleString('es-ES', options);
        }
    },

    datems:
    {
        type: Date,
        default: () =>
        {
            const date = new Date();

            return date.getTime();
        }
    }
});

PhotoSchema.methods.toJSON = function()
{
    const {__v, _id, ...photo} = this.toObject();

    // Cambio el nombre de _id a uid
    photo.uid = _id;

    return photo;
}

module.exports = model('Photo', PhotoSchema);