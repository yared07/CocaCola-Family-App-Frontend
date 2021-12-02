import React, { useState, useContext, useEffect } from 'react'
import { CameraComponent, GameStartOverlay, QuestionOverlay } from '../components'
import { useNavigate } from 'react-router-dom'
import { getQuiz, getChallenge } from '../_helpers/cloudFunctions';
import { ToastContainer, toast, Slide } from 'react-toastify';
import RouteContext from '../_helpers/routeContext';
import UserContext from '../_helpers/userContext';
import { createChallengeInstance, addChallenge, onChallengeCreated, answerQuestion, getScore } from '../_helpers/cloudFunctions'
import Acknowledge from '../components/Acknowledge'

function GamePlayPage() {
    const [gameStared, setGameStared] = useState(false)
    const [questions, setQuestions] = useState([])
    const { path } = useContext(RouteContext)
    const { user } = useContext(UserContext);
    const { storePath } = useContext(RouteContext)
    const [questoionsIndex, setQuestionsIndex] = useState(0)
    const [currentQuestion, setCurrentQuestion] = useState({})
    const [challengeAnswers, setChallengeAnswers] = useState([])
    const [readyToAnswer, setReadyToAnswer] = useState(true)
    const [choice, setChoice] = useState(null);
    const [quizEnd, setQuizEnd] = useState(false)
    let navigate = useNavigate();

    useEffect(() => {
        if (questoionsIndex === questions.length && gameStared && questoionsIndex !== 0 && !quizEnd) {

            setReadyToAnswer(false)
            if (path?.via === "CHALLENGE") {
                uploadAnswerAndRedirectToScore(path?.challengeId)
            } if (path?.via === "TOGETHER") {
                calculateAndUploadScore()
            }
            else {
                setQuizEnd(true);
                uploadChallangeAndSendSms(challengeAnswers)
            }

        }

        //eslint-disable-next-line
    }, [challengeAnswers, questoionsIndex])
    useEffect(() => {
        var singleChallenge;
        var result = choice
        if (result !== null && !readyToAnswer) {
            if (path?.via === "TOGETHER") {
                if (result != null) {

                    if (gameStared === false) {
                        startGame()
                        return
                    }
                    singleChallenge = result;
                }
            } else {
                if (result === -1) {
                    if (gameStared === false) {

                        startGame()
                        return
                    }
                    singleChallenge = {
                        "questionId": currentQuestion?.question?.questionId,
                        "choiceId": currentQuestion?.answers?.choice2?.choiceId
                    }
                } else if (result === 1) {
                    if (gameStared === false) {
                        navigate(-1)
                        return
                    }
                    singleChallenge = {
                        "questionId": currentQuestion?.question?.questionId,
                        "choiceId": currentQuestion?.answers?.choice1?.choiceId
                    }
                }
            }
            setChallengeAnswers((oldArray => [...oldArray, singleChallenge]))
            if (questions.length - 1 > questoionsIndex) {

                setCurrentQuestion(questions[questoionsIndex + 1])
                setQuestionsIndex(questoionsIndex + 1);

            } else {
                setQuestionsIndex(questoionsIndex + 1);
            }
        }

        setTimeout(() => {
            setReadyToAnswer(true);
        }, 1000)

        //eslint-disable-next-line 
    }, [readyToAnswer, choice])

    return (
        <>
            <CameraComponent onChoiceMade={onChoiceMade} readyToAnswer={readyToAnswer} quizEnd={quizEnd} />
            {
                !quizEnd ?  gameStared ? <QuestionOverlay currentQuestion={currentQuestion} /> : <GameStartOverlay startGame={startGame} />  : <Acknowledge/>

            }

            <ToastContainer autoClose={4500} theme="dark" transition={Slide} />
          
        </>
    )
    function onChoiceMade(result) {
        setReadyToAnswer(false)
        setChoice(result);
    }

    function startGame() {
        setGameStared(true);
        if (path?.via === "CHALLENGE") {
            var challengeInstanceId = path?.challengeId;
            getChallenge(challengeInstanceId)
                .then(response => {
                    console.log(response.data)
                    setQuestions(response.data.questions)

                    setCurrentQuestion(response.data.questions[0])
                    setGameStared(true);
                    console.log(response.data.questions)
                }).catch(e => {
                    console.log(e.response?.data?.msg?.detail)
                    toast(e.response?.data?.msg?.detail || 'Error has occured.', {
                        position: "bottom-center",
                        autoClose: 4500,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: false,
                        progress: undefined,
                    });
                })
        } else {
            getQuiz(8)
                .then(response => {
                    setQuestions(response.data.questions)
                    setCurrentQuestion(response.data.questions[0])
                    setGameStared(true);
                }).catch(e => {
                    console.log(e.response?.data?.msg?.detail)
                    toast(e.response?.data?.msg?.detail || 'Error has occured.', {
                        position: "bottom-center",
                        autoClose: 4500,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: false,
                        progress: undefined,
                    });
                })
        }
    }
    function uploadAnswerAndRedirectToScore(challengeInstanceId) {

        for (const challenge of challengeAnswers) {
            var singleAnswer = {
                challangeId: challengeInstanceId,
                respondentId: user,
                questionId: challenge?.questionId,
                questionChoiceId: challenge?.choiceId
            }
            answerQuestion(singleAnswer.respondentId, singleAnswer.challangeId, singleAnswer.questionId, singleAnswer.questionChoiceId)
                .then(res => {
                    console.log(res)
                }).catch(err => {
                    console.error(err)
                })
        }

        getScore(challengeInstanceId, user)
            .then(res => {
                storePath({ "SCORE": res?.data?.percentage })
                navigate(`/score`)
            }).catch(err => {
                console.log(err)
            })

    }
    function uploadChallangeAndSendSms(challengeAnswers) {
        var challengerId = user;
        createChallengeInstance(challengerId)
            .then(res => {
                var challangeInstanceId = res?.data?.challangeInstanceId

                for (const challenge of challengeAnswers) {
                    var singleChallenge = {
                        questionId: challenge?.questionId,
                        challangeInstanceId: challangeInstanceId,
                        answerId: challenge?.choiceId
                    }
                    addChallenge(singleChallenge.questionId, singleChallenge.challangeInstanceId, singleChallenge.answerId)
                        .then(res => {
                            console.log(res.data)
                        }).catch(err => {
                            console.log(err)
                        })
                }
                onChallengeCreated(challangeInstanceId)
                    .then(res => {
                    }).catch(err => {
                        console.log(err)
                    })

            }).catch(err => {
                console.log(err)

            })
    }
    function calculateAndUploadScore() {
        console.log(challengeAnswers)
        var score =0;
        var percentage=0
        for (const challenge of challengeAnswers){
            if (challenge===1){
                score=score+1;
            }
        }
        const totalQuestions = challengeAnswers.length;
        percentage=(score/totalQuestions)*100;
        //TODO: add endpoint to score for challenge
        storePath({ "SCORE": percentage })
        navigate(`/score`)
    }
}

export default GamePlayPage