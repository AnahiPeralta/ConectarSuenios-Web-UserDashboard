const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const { Schema } = mongoose;

const candidateSchema = new Schema({
    name: String,
    lastname: String,
    dni: String,
    birthdate: Date,
    age: Number,
    email: String,
    tel: Number,
    pais: String,
    provincia: String,
    provincia_alt: String,
    departamento: String,
    address: String,
    career: String,
    link: String,
    phrase: String,
    state: String
});

const agentSchema = new Schema({
    nameR:String,
    dniR: String,
    telFijo: Number,
    telMovil: Number,
    emailR: String,
    position: String
});

const institutionSchema = new Schema({
    nameI: String,
    tipoI: String,
    orientacionI: String,
    paisI: String,
    provinciaI: String,
    departamentoI: String,
    direccionI: String
});

const padrinoSchema = new Schema({
    nameP: String,
    lastnameP: String,
    dniP: String,
    telFijo: Number,
    telMovil: Number,
    emailP: String,
    paisP: String,
    provinciaP: String,
    direccionP: String
});



const apadrinadoSchema = new Schema({
    nameCand: String,
    lastnameCand: String,
    dniCand: String,
    birthdateCand: Date,
    ageCand: Number,
    emailCand: String,
    telCand: Number,
    paisCand: String,
    provinciaCand: String,
    provincia_altCand: String,
    departamentoCand: String,
    addressCand: String,
    careerCand: String,
    linkCand: String,
    phraseCand: String,
    stateCand: String,
    nameI: String,
    tipoI: String,
    orientacionI: String,
    paisI: String,
    provinciaI: String,
    departamentoI: String,
    direccionI: String,
    nameR:String,
    dniR: String,
    telFijo: Number,
    telMovil: Number,
    emailR: String,
    position: String
});



const seguimientoSchema = new Schema({
    candidateApad: String,
    emailApad: String,
    institutionApad: String,
    stateApad: String,   
    dateApad: Date,
    stateFollow: String
});



const userSchema = new Schema({
    email: String,
    password: String,
    role: String,
    candidates: [candidateSchema],
    agents: [agentSchema],
    institutions: [institutionSchema],
    padrinos: [padrinoSchema],
    apadrinados: [apadrinadoSchema],
    seguimientos: [seguimientoSchema]
});


userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};


userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('users', userSchema);