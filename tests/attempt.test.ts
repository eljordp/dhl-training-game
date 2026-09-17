import assert from 'node:assert/strict';
import test from 'node:test';
import {prepareQuizAttempt} from '../src/lib/prepareQuizAttempt';
import {assessmentQuestions} from '../src/data/assessment';
import {GRADING_VERSION} from '../src/lib/gradeAssessment';
import {employeeRun} from './fixtures/employee-run';
const input=()=>({score:100,correctAnswers:37,totalQuestions:37,timeSpent:267,difficulty:'all',questionResults:assessmentQuestions.map(q=>({questionId:q.id,userAnswer:employeeRun[q.id],gradingVersion:GRADING_VERSION,correct:true,score:100}))});
test('saved result is recomputed and includes the exact question and rubric version',()=>{
 const result=prepareQuizAttempt(input());
 assert.equal(result.score,97);assert.equal(result.correctAnswers,36);
 assert.equal(result.questionResults[1].reviewRequired,true);
 assert.equal(result.questionResults[0].questionText,assessmentQuestions[0].question);
 assert.deepEqual(result.questionResults[0].answerKey,assessmentQuestions[0].answerKey);
});
test('duplicate, incomplete, unknown, oversized and stale attempts are rejected',()=>{
 const duplicate=input();duplicate.questionResults[1]=duplicate.questionResults[0];assert.throws(()=>prepareQuizAttempt(duplicate));
 const missing=input();missing.questionResults.pop();assert.throws(()=>prepareQuizAttempt(missing));
 const unknown=input();unknown.questionResults[0].questionId='invented';assert.throws(()=>prepareQuizAttempt(unknown));
 const huge=input();huge.questionResults[0].userAnswer='a'.repeat(4001);assert.throws(()=>prepareQuizAttempt(huge));
 const stale=input();stale.questionResults[0].gradingVersion='old';assert.throws(()=>prepareQuizAttempt(stale));
 const time=input();time.timeSpent=-1;assert.throws(()=>prepareQuizAttempt(time));
});
