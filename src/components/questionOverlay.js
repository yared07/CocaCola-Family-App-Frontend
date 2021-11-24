import React, { useEffect, useState, useContext } from 'react'
import flower from '../assets/img/flower.png'
import bottle from '../assets/img/bottle.png'
import cork from '../assets/img/cork.png'
import flame1 from '../assets/img/flame-1.png'
import Loader from "react-loader-spinner";
import Popup from 'reactjs-popup';
import UserContext from '../_helpers/userContext';
import { createChallengeInstance, addChallenge, onChallengeCreated, answerQuestion, getScore } from '../_helpers/cloudFunctions'
import RouteContext from '../_helpers/routeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Acknowledge } from '.'


function QuestionOverlay(props) {
    const [questoionsIndex, setQuestionsIndex] = useState(0)
    const [currentQuestion, setCurrentQuestion] = useState({})
    const [challengeAnswers, setChallengeAnswers] = useState([])
    const [open, setOpen] = useState(false);
    const [ackOpen, setAckOpen] = useState(false);
    const { user } = useContext(UserContext);
    const { path } = useContext(RouteContext)
    const { storePath } = useContext(RouteContext)

    let navigate = useNavigate()
    let { pathname } = useLocation()
    let pathArr = pathname.split('/')
    let rootUrl = pathArr[pathArr.length - 2] || '';
    
    const toggleModal = (state) => setOpen(state);

    useEffect(() => {
        loadQuestion();
    }, []);
    useEffect(() => {
        const { questions } = props.questions
        if (questoionsIndex === questions.length) {
            if (path?.via === "CHALLENGE") {
                uploadAnswerAndRedirectToScore(path?.challengeId)
            } else {
                uploadChallangeAndSendSms(challengeAnswers)
            }
        }
        
        //eslint-disable-next-line
    }, [challengeAnswers, questoionsIndex])
    return (
        <div className="main-overlay ">
            <h2 className="question">{(currentQuestion?.question?.questionText?.toString())}</h2>
            <div className="btn-group">
                <button className="img-btn img-btn--small" onClick={onChoiceMade} id={(currentQuestion?.answers?.choice1?.choiceId?.toString())}>
                    <span className="img-btn__text" id={(currentQuestion?.answers?.choice1?.choiceId?.toString())}>
                        {(currentQuestion?.answers?.choice1?.choiceText?.toString())}
                    </span>
                </button>
                <button className="img-btn img-btn--small" onClick={onChoiceMade} id={(currentQuestion?.answers?.choice2?.choiceId?.toString())}>
                    <span className="img-btn__text" id={(currentQuestion?.answers?.choice2?.choiceId?.toString())}>
                        {(currentQuestion?.answers?.choice2?.choiceText?.toString())}
                    </span>
                </button>
            </div>
            <img src={flower} alt="" className="floating-img floating-img--1" />
            <img src={flower} alt="" className="floating-img floating-img--2" />
            <img src={flower} alt="" className="floating-img floating-img--3" />
            <img src={flame1} alt="" className="floating-img floating-img--4" />
            <img src={bottle} alt="" className="floating-img floating-img--5" />
            <img src={flower} alt="" className="floating-img floating-img--6" />
            <img src={cork} alt="" className="floating-img floating-img--7" />

            <Popup open={open} closeOnDocumentClick={false} onClose={() => toggleModal(false)}>
                <div className="modal">
                    <Loader
                        type="TailSpin"
                        color="#FEFEFE"
                        height={40}
                        width={40}
                    />
                    <span className="modal__text">Loading...</span>
                </div>
            </Popup>

            <Popup lockScroll={true} open={ackOpen} className="ackno-popup" closeOnDocumentClick>
                <Acknowledge />
            </Popup>
        </div>

    )
    function loadQuestion() {
        const { questions } = props.questions;
        setCurrentQuestion(questions[questoionsIndex])
    }
    function onChoiceMade(event) {
        const { questions } = props.questions;

        var singleChallenge = {
            "questionId": currentQuestion?.question?.questionId,
            "choiceId": event?.target?.id
        }

        setChallengeAnswers((oldArray => [...oldArray, singleChallenge]))
        if (questions.length - 1 > questoionsIndex) {

            setCurrentQuestion(questions[questoionsIndex + 1])
            setQuestionsIndex(questoionsIndex + 1);

        } else {
            setQuestionsIndex(questoionsIndex + 1);
            setOpen(true)

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
                storePath({"SCORE":res?.data?.percentage})
                console.log("Here")
                navigate(`/${rootUrl ? rootUrl + '/' : ''}score`)
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
                        setAckOpen(true)
                        setOpen(false)
                    }).catch(err => {
                        console.log(err)
                    })

            }).catch(err => {
                console.log(err)

            })


    }
}


export default QuestionOverlay
