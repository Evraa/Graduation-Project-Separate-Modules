import { Stack, IconButton, TextField, DefaultButton, Label } from '@fluentui/react';
import React, {useState} from 'react'
import './applyjob.css'

function ApplyJob() {


    const jobTitle = 'Software Engineer';
    const jobDescription = 'Software Engineer at google';


    const [viewTitleSection, setviewTitleSection] = useState(false);
    const [viewDescriptionSection, setviewDescriptionSection] = useState(false);
    const [viewCVSection, setviewCVSection] = useState(false);
    const [viewVideoSection, setviewVideoSection] = useState(false);
    const [viewQSection, setviewQSection] = useState(false);

    const QA = [
        {'_id': "1", 'body': "why do you apply"},
        {'_id': "2", 'body': "when do you apply"},
        {'_id': "3", 'body': "how do you apply"},
        {'_id': "4", 'body': "what are you applying for"},
        {'_id': "5", 'body': "where are you applying"}
    ];
    const initialQuestions = QA.map(val => {
        return {...val, 'answer': ''}
    })

    const [questions, setquestions] = useState(initialQuestions);

    const questionElement =  initialQuestions.map ( (question, index) =>
        <TextField 
        label={question.body}
        type="text" 
        key={question.id}
        required
        className='apply_job_questions'
        value={questions[index].answer}
        onChange={(e) => setquestions(
            prevState => [...prevState, prevState[index] ={...prevState[index], 'answer': e.target.value}])}/>
    )


    const ChevronDown = { iconName: 'ChevronDown' };
    const ChevronUp = { iconName: 'ChevronUp' };
    const TaskSolid = { iconName: 'TaskSolid' };

    const changeFile = () => {
        console.log('changed');
    }

    return (
        <Stack vertical className='apply_job_main'>
            <div style={{fontSize:'50px', alignSelf: 'start', paddingBottom: '30px', fontWeight: 'bold', color: 'blue'}}>
                Apply on Job
            </div>



            <div style={{width:'100%'}} >
                <div className='apply_job_title' onClick={()=>setviewTitleSection(previousState => !previousState)}>
                    <Stack horizontal className='apply_job_section' horizontalAlign='space-between'>
                        <div>
                            Job Title
                        </div>
                        <IconButton iconProps={viewTitleSection? ChevronUp: ChevronDown} 
                        title="Chevron" ariaLabel="Chevron" disabled={false}
                        />
                    </Stack>
                </div>
                {
                    viewTitleSection &&
                    <Label
                        className='add_job_title_section_content'
                        styles={{root:{textAlign:'start'}}}
                    >{jobTitle}</Label>
                }
            </div>



            <div style={{width:'100%'}} >
                <div className='apply_job_title' onClick={()=>setviewDescriptionSection(previousState => !previousState)}>
                    <Stack horizontal className='apply_job_section' horizontalAlign='space-between'>
                        <div>
                            Job Description
                        </div>
                        <IconButton iconProps={viewDescriptionSection? ChevronUp: ChevronDown} 
                        title="Chevron" ariaLabel="Chevron" disabled={false}
                        />
                    </Stack>
                </div>
                {
                    viewDescriptionSection &&
                    <Label 
                        className='add_job_title_section_content'
                        styles={{root:{textAlign:'start'}}}
                    >{jobDescription}</Label>
                }
            </div>


            <div style={{width:'100%'}} >
                <div className='apply_job_title' onClick={()=>setviewVideoSection(previousState => !previousState)}>
                    <Stack horizontal className='apply_job_section' horizontalAlign='space-between'>
                        <div>
                            Upload Introductory Video
                        </div>
                        <IconButton iconProps={viewVideoSection? ChevronUp: ChevronDown} 
                        title="Chevron" ariaLabel="Chevron" disabled={false}
                        />
                    </Stack>
                </div>
                {
                    viewVideoSection &&
                    <div style = {{paddingBottom: '30px'}}>
                        <Stack horizontal className='apply_job_section_content' horizontalAlign='space-between'>
                            <div style={{alignSelf:'start'}}>
                                Please Upload an introductory video to yourself
                            </div>
                            <input type="file" onChange={changeFile} style={{alignSelf:'end'}}/>
                            
                        </Stack>
                    </div>
                }
            </div>



            <div style={{width:'100%'}} >
                <div className='apply_job_title' onClick={()=>setviewQSection(previousState => !previousState)}>
                    <Stack horizontal className='apply_job_section' horizontalAlign='space-between'>
                        <div>
                            Behavioural Analysis
                        </div>
                        <IconButton iconProps={viewQSection? ChevronUp: ChevronDown} 
                        title="Chevron" ariaLabel="Chevron" disabled={false}
                        />
                    </Stack>
                </div>
                {
                    viewQSection &&
                    <div style = {{paddingBottom: '30px'}}>
                        <Stack vertical tokens={{childrenGap: '20px'}} className='apply_job_section_content'>
                            {questionElement}
                        </Stack>
                    </div>
                }
            </div>


            <div style={{width:'100%'}} >
                <div className='apply_job_title' onClick={()=>setviewCVSection(previousState => !previousState)}>
                    <Stack horizontal className='apply_job_section' horizontalAlign='space-between'>
                        <div>
                            Upload CV
                        </div>
                        <IconButton iconProps={viewCVSection? ChevronUp: ChevronDown} 
                        title="Chevron" ariaLabel="Chevron" disabled={false}
                        />
                    </Stack>
                </div>
                {
                    viewCVSection &&
                    <div style = {{paddingBottom: '30px'}}>
                        <Stack horizontal className='apply_job_section_content' horizontalAlign='space-between'>
                            <div style={{alignSelf:'start'}}>
                                Please Upload your CV
                            </div>
                            <input type="file" onChange={changeFile} style={{alignSelf:'end'}}/>
                            
                        </Stack>
                    </div>
                }
            </div>


            <div style={{padding: '40px', paddingRight:'15%', width: '100%', textAlign: 'right'}}>
                <DefaultButton 
                    text='Apply' iconProps={TaskSolid} 
                    styles={{root:{alignSelf:'end', borderColor: 'blue'}, label:{color:'blue', fontWeight:'bold'}}} 
                />                      
            </div>
        </Stack>
    )
}

export default ApplyJob
