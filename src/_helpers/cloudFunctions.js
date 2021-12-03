// import { httpsCallable } from "firebase/functions";
// import { functions } from "./Firebase";
import axios from "axios";

const api = 'https://0473-2a01-4f8-172-40a6-00-2.ngrok.io/coke-cny/us-central1'
// const api = 'https://us-central1-macallan-ecf92.cloudfunctions.net/verifyToken'

axios.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
    if(error.response?.status === 401) {
        localStorage.removeItem("_user")
        window.location.reload()
    }
    return Promise.reject(error);
});

export const getScore = (challangeId,respondentId ) => {
   return axios.post(`${api}/getScore`, {challangeId, respondentId}); 
}
export const getChallenge = (challengeInstanceId) =>{
    return axios.post(`${api}/getChallenge`, {challengeInstanceId});
}
export const onChallengeCreated = (challengeInstanceId) =>{
    return axios.post(`${api}/onChallengeCreated`,{challengeInstanceId})
}
export const addChallenge = (questionId,challangeInstanceId,answerId) => {
    return axios.post(`${api}/addChallange`,{questionId,challangeInstanceId,answerId});
}
export const sendCode = (name,phone_number) =>{
    return axios.post(`${api}/sendCode`,{name,phone_number},)
}
export const createChallengeInstance = (challangerId) =>{
    return axios.post(`${api}/createChallangeInstance`,{challangerId})
}
export const verifyToken = (verificationId,sms_token) => {
    return axios.post(`${api}/verifyToken`,{verificationId,sms_token});
}

export const generateInviteLink = (uid, relation) => {
    return axios.post(`${api}/generateInviteLink`, {uid: uid, relation})
}

export const onInvitationLink = (invitationId, invitedId) => {
    return axios.post(`${api}/onInvitationLink`, {invitationId, invitedId})
}

export const addFamily = (userId, familyMemberId, relation) => {
    return axios.post(`${api}/addFamily`, {userId, familyMemberId, relation})
}

export const getInviteDetails = (invitationId) => {
    return axios.post(`${api}/getInviteDetails`, {invitationId})
}

export const addQuestion = (questionText) => {
    return axios.post(`${api}/addQuestion`, {questionText})
}

export const addChoiceToQuestion = (qid, answersText) => {
    return axios.post(`${api}/addChoiceToQuestion`, {qid, answersText})
}

export const answerQuestion = (respondentId, challangeId, questionId, questionChoiceId) => {
    return axios.post(`${api}/answerQuestion`, {respondentId, challangeId, questionId, questionChoiceId})
}

export const getQuiz = (numberOfQuestions) => {
    return axios.post(`${api}/getQuiz`, {numberOfQuestions})
}

export const addScoreForPlayTogether = (respondentId,netScore,percentage) => {
    return axios.post(`${api}/addScoreForPlayTogether`,{respondentId,netScore,percentage})
}

// admin apis
export const getUsers = (uid, itemsPerPage, page, token) => {
    return axios.post(`${api}/getUsersList`, {uid, itemsPerPage, page, token})
}

export const adminLogin = (username, password) => {
    return axios.post(`${api}/adminLogin`, {username, password})
}

export const adminGetQuestions = (uid, token, itemsPerPage, page) => {
    return axios.post(`${api}/getQuestionsList`, {uid, token, itemsPerPage, page})
}

export const editQuestion = (questionId, questionText, uid, token) => {
    return axios.post(`${api}/editQuestion`, {questionId, questionText, uid, token})
}

export const editChoice = (choiceId, answersText, uid, token) => {
    return axios.post(`${api}/editQuestionChoice`, {choiceId, answersText, uid, token})
}

export const addFullQuestion = (question) => {
    return axios.post(`${api}/addMultipleQuestions`, { questions: [
        question
    ]})
}

export const deleteQuestion = (questionId, uid, token) => {
    return axios.post(`${api}/deleteQuestion`, {questionId, uid, token})
}
