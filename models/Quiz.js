const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuizSchema = new Schema({
    type: {
        type: String,
        default: "Cat1"
    },

    question: {
        type: String,
        required: true
    },

    optionA: {
        type: String,
        required: true
    },

    optionB: {
        type: String,
        required: true
    },

    optionC: {
        type: String,
        required: true
    },

    optionD: {
        type: String,
        required: true
    },

    answer: {
        type: String,
        required: true
    },

    dateCreated: {
        type: Date,
        default: new Date()
    },

    image: {
        type: String,
    },

    delete: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('quiz', QuizSchema);