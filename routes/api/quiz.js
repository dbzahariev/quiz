const express = require('express');
const router = express.Router();

const Quiz = require('../../models/Quiz');

const validateAddQuestion = require('../../utils/validation/addQuestion');

// Add new quiz question
// @route POST /api
// @desc add question
// @access Private
router.post('/', (req, res) => {
    const { errors, isValid } = validateAddQuestion(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const quiz = new Quiz({
        type: req.body.type,
        question: req.body.question,
        optionA: req.body.optionA,
        optionB: req.body.optionB,
        optionC: req.body.optionC,
        optionD: req.body.optionD,
        answer: req.body.answer,
        delete: false
    });
    if (req.body.image) {
        quiz.image = req.body.image
    }

    quiz.save()
        .then(quiz => {
            console.log("Add question", quiz.question)
            return res.json(quiz)
        })
        .catch(err => console.log(err));
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

// Gets free quiz questions
// @route GET /api/getFreeQuiz
// @desc get questions
// @access Private
router.get('/getFreeQuiz', (req, res) => {
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    console.log("hiiii", fullUrl)
    Quiz.find({ delete: false })
        .then(quizzess => {
            let newQuestionsArr = shuffleArray(quizzess).slice(0, Math.min(quizzess.length, 15))
            if (newQuestionsArr.length === 0) newQuestionsArr = [{}]
            return res.json(newQuestionsArr)
        })
        // .then(quizzess => res.json([{}]))
        .catch(err => console.log(err));
});

// Gets all quiz questions
// @route GET /api/all
// @desc get questions
// @access Private
router.get('/all', (req, res) => {
    Quiz.find({ delete: false })
        .then(quizzess => res.json(quizzess))
        .catch(err => console.log(err));
});

// Gets all quiz questions
// @route GET /api/allCount
// @desc get questions
// @access Private
router.get('/allCount', (req, res) => {
    Quiz.find({ delete: false })
        .then(quizzess => res.json(quizzess.length))
        .catch(err => console.log(err));
});

// Gets quiz questions
// @route GET /api/category/:category
// @desc get questions by category
// @access Private
router.get('/category/:quizCategory', (req, res) => {
    Quiz.find({ type: req.params.quizCategory })
        .then(quizzes => res.json(quizzes))
        .catch(err => console.log(err));
});

// Update Quiz
// @route PUT /api/updateQuestion/:id
// @desc update quiz question by Id
// @access Private
router.put('/updateQuestion/:id', (req, res) => {
    const { errors, isValid } = validateAddQuestion(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const quiz = new Quiz({
        // type: req.body.type,
        question: req.body.question,
        optionA: req.body.optionA,
        optionB: req.body.optionB,
        optionC: req.body.optionC,
        optionD: req.body.optionD,
        optionD: req.body.optionD,
        answer: req.body.answer,
        delete: req.body.delete || false,
    });

    Quiz.findOneAndDelete({ _id: req.params.id })
        .then((returnedQuiz) => {
            if (!returnedQuiz) {
                errors.noQuiz = 'No Question found';
                return res.status(404).json(errors);
            }
            quiz.save()
                .then(() => {
                    res.json({ message: 'Question updated successfully!', newId: quiz._id });
                })
                .catch(err => {
                    console.log(err)
                    return res.status(400).json(err);
                });
        })
        .catch(err => {
            console.log(err)
            return res.status(400).json(err);
        });
});

// removes all quiz questions
// @route DELETE /api/all
// @desc remove questions
// @access Private
router.delete('/all', (req, res) => {
    Quiz.remove()
        .then(info => res.json({ message: 'Successfully removed questions' }))
        .catch(err => console.log(err));
});

// removes quiz question
// @route DELETE /api/category/:category
// @desc removes quiz questions by category
// @access Private
router.delete('/category/:quizCategory', (req, res) => {
    Quiz.remove({ type: req.params.quizCategory })
        .then(() => res.json({ message: 'Successfully removed questions' }))
        .catch(err => console.log(err));
});

// removes quiz questions
// @route DELETE /api/:id
// @desc removes quiz question by id
// @access Private
router.delete('/:id', (req, res) => {
    Quiz.findByIdAndDelete({ _id: req.params.id })
        .then(() => res.json({ message: 'Successfully removed question' }))
        .catch(err => console.log(err));
});

module.exports = router;