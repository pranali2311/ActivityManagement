const mongoose = require('mongoose');

//Workshop Details Schema
const WorkshopSchema = mongoose.Schema({
   wname:{
       type: String,
       required: true
   },
    sdate:{
        type: String,
        required: true
    },
    cdate:{
        type: String,
        required: true
    },
    team:{
        type: String,
        required: true
    },
    body:{
       type: String,
        required: true
    },
    file:{
        type: String,
        required: true
    }
});

const Workshop = module.exports = mongoose.model('Workshop',WorkshopSchema);