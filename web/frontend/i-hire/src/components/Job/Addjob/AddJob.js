import { Stack, IconButton, TextField, CommandButton,
        DialogFooter, ContextualMenu, Dialog, Label,
        PrimaryButton, DefaultButton, ComboBox } from '@fluentui/react'
import { Toggle } from '@fluentui/react/lib/Toggle';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { baseUrl } from '../../../env';
import { resetCurrentJob } from '../../../redux';
import './addjob.css'

function AddJob() {

    const path = window.location.pathname;
    const [key, setkey] = useState(0);
    const [errCreateJob, seterrCreateJob] = useState([]);

    const [reqVideo, setreqVideo] = useState(true);
    const [jobTitle, setjobTitle] = useState('');
    const [jobDescription, setjobDescription] = useState('');


    const [viewTitleSection, setviewTitleSection] = useState(false);
    const [viewDescriptionSection, setviewDescriptionSection] = useState(false);
    const [viewVideoSection, setviewVideoSection] = useState(false);
    const [viewQSection, setviewQSection] = useState(false);
    const [viewAddQSection, setviewAddQSection] = useState(false);

    const [hideAddDialog, sethideAddDialog] = useState(true);
    const [addQuestion, setaddQuestion] = useState("");
    const [errAddQ, seterrAddQ] = useState("");

    const [hideSearchDialog, sethideSearchDialog] = useState(true);
    const [searchQuestion, setsearchQuestion] = useState("");

    const [hideChooseDialog, sethideChooseDialog] = useState(true);
    const [chooseQuestion, setchooseQuestion] = useState({});
    const [errChooseQ, seterrChooseQ] = useState("");

    const [questionSet, setquestionSet] = useState([]);

    const currentUser = useSelector(state => state.currentUser);
    const currentJob = useSelector(state => state.currentJob);

    const token = currentUser.token;

    const [questionsFromSearch, setquestionsFromSearch] = useState([]);

    const dispatch = useDispatch();


    const ChevronDown = { iconName: 'ChevronDown' };
    const ChevronUp = { iconName: 'ChevronUp' };

    const dragOptions = {
        moveMenuItemText: 'Move',
        closeMenuItemText: 'Close',
        menu: ContextualMenu,
        keepInBounds: true,
      };


    const menuProps = {
        items: [
        {
            key: 'Addnewquestion',
            text: 'Add new question',
            iconProps: { iconName: 'Add' },
            onClick: ()=> sethideAddDialog(false)
        },
        {
            key: 'Searchexistingquestions',
            text: 'Search existing questions',
            iconProps: { iconName: 'Search' },
            onClick: ()=> sethideSearchDialog(false)
        },
        ],
    };

    useEffect(()=>{
        const path = window.location.pathname;
        if(path === '/edit'){
            setjobTitle(currentJob.title);
            setjobDescription(currentJob.description);
            setreqVideo(currentJob.videoRequired);
            const qs = currentJob.questions;
            qs.map(val => {
                val.text = val.body; 
                val.key = val._id; 
                val.ID = val._id;
                delete val._id;
                return val;
            })
            setquestionSet(qs);
        }
        return () => {
            dispatch(resetCurrentJob());
        }
    },[dispatch]);

    const addNewQuestion = async () => {
        try{
            const data = {
                body: addQuestion
            }
            const res = await fetch(baseUrl + "/question/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(data)
            });
            const data2 = await res.json();
            console.log(data2);
            if(res.ok){
                setkey(prev=>prev+1);
                setquestionSet(prev => [
                    ...prev, {key:key, body: addQuestion, required: true, ID: data2._id}
                ]);
                sethideAddDialog(true); 
                setaddQuestion('');
                seterrAddQ('');
            }
            else {
                seterrAddQ(data2["errors"][0]['msg']);
            }
        }
        catch(err) {
            console.log(err);
        }
    }

    const searchForQuestion = async () => {
        try{
            const res = await fetch(baseUrl + "/question/?q="+searchQuestion, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
            });
            const data2 = await res.json();
            if(res.ok){
                for (let i in data2){
                    data2[i].key = data2[i]._id;
                    data2[i].text = data2[i].body;
                }
                setquestionsFromSearch(data2);
                sethideChooseDialog(false);
            }
            else {
                console.log(data2["errors"][0]['msg']);
            }
        }
        catch(err) {
            console.log(err);
        }
    }

    const addExistingQuestion = () => {
        if(chooseQuestion.body){
            console.log(chooseQuestion);
            setkey(prev=>prev+1);
            setquestionSet(prev => [
                ...prev, {key:key, body: chooseQuestion.body, required: true, ID: chooseQuestion._id}
            ]);
            sethideChooseDialog(true);
            sethideSearchDialog(true);
            setsearchQuestion('');
            setchooseQuestion({});
            seterrChooseQ('');
        }
        else{
            seterrChooseQ("choose a question");
        }
    }

    const createJob = async ()=> {
        const questions = questionSet
        questions.forEach(i => {delete i.text; delete i.key;} );
        const data = {
            title: jobTitle,
            description: jobDescription,
            videoRequired: reqVideo,
            questions: questions
        }
        console.log(data);
        try{
            const res = await fetch(baseUrl + "/job/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(data)
            });
            const data2 = await res.json();
            console.log(data2);
            if(res.ok){
                
            }
            else {
                const errors = data2.errors;
                console.log(errors);
                const newErrors = {};
                errors.forEach(element => {
                    newErrors[element.param] = element.msg;
                });
                seterrCreateJob(newErrors);
            }
        }
        catch(err){
            console.log(err);
        }
    }

    const questionElement = 
    <Stack vertical tokens={{childrenGap: '20px'}} className='add_job_section_content'>
        {questionSet.map((value, index) =>
            <Stack horizontal horizontalAlign='space-between' className="add_job_question" key={questionSet[index].key}>
                <div style= {{width: '50%', textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'start'}}>
                    {questionSet[index].body}
                </div>
                <Toggle 
                    onText="required" offText="not required" 
                    onChange={(e, checked)=>setquestionSet(prev => { 
                        prev[index].required = checked; 
                        console.log(prev[index].required);
                        return [...prev];
                    })}
                    checked={value.required}
                />
                <IconButton 
                    iconProps={{iconName: 'Cancel'}} 
                    onClick={()=>{
                        setquestionSet(prev => {prev.splice(index, 1); return [...prev];});
                        console.log(value.key);
                        console.log(questionSet);
                    }}
                />
            </Stack>
        )}
    </Stack>
            

    return (
        <div>
            <Stack vertical className='add_job_main'>
                <div style={{fontSize:'50px', alignSelf: 'start', paddingBottom: '30px', fontWeight: 'bold', color: 'blue'}}>
                    {path === '/edit' ? 'Edit Job': 'Create Job'}
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
                        <div className='add_job_title_section_content'>
                            <TextField 
                                label='Job Title'
                                type="text"
                                required
                                styles={{root:{textAlign:'start'}}}
                                value={jobTitle}
                                onChange={(e) => setjobTitle(e.target.value)}
                            />
                            <Label className='login_label' styles={{root:{textAlign:'end'}}}>{errCreateJob['title']}</Label>
                        </div>
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
                        
                        <div className='add_job_title_section_content'>
                            <TextField 
                                label='Job Description'
                                type="text"
                                required
                                multiline={true}
                                styles={{root:{textAlign:'start'}}}
                                value={jobDescription}
                                onChange={(e) => setjobDescription(e.target.value)}
                            />
                            <Label className='login_label' styles={{root:{textAlign:'end'}}}>{errCreateJob['description']}</Label>
                        </div>
                    }
                </div>


                <div style={{width:'100%'}} >
                    <div className='apply_job_title' onClick={()=>setviewVideoSection(previousState => !previousState)}>
                        <Stack horizontal className='apply_job_section' horizontalAlign='space-between'>
                            <div>
                                Introductory Video
                            </div>
                            <IconButton iconProps={viewVideoSection? ChevronUp: ChevronDown} 
                            title="Chevron" ariaLabel="Chevron" disabled={false}
                            />
                        </Stack>
                    </div>
                    {
                        viewVideoSection &&
                        <Stack horizontal horizontalAlign='space-between' className="add_job_section_content">
                            <div>
                                An introductory video is required
                            </div>
                            <Toggle 
                                onText="On" offText="Off" 
                                onChange={(e, checked) => {setreqVideo(checked)}} 
                                checked={reqVideo}
                            />
                        </Stack>
                    }
                </div>



                <div style={{width:'100%'}} >
                    <div className='apply_job_title' onClick={()=>setviewAddQSection(previousState => !previousState)}>
                        <Stack horizontal className='apply_job_section' horizontalAlign='space-between'>
                            <div>
                                Add Question
                            </div>
                            <IconButton iconProps={viewAddQSection? ChevronUp: ChevronDown} 
                            title="Chevron" ariaLabel="Chevron" disabled={false}
                            />
                        </Stack>
                    </div>
                    {
                        viewAddQSection &&
                        <div  className="add_job_section_content">
                            <Stack horizontal horizontalAlign='space-between'>
                                <div>
                                    Add a question to job application
                                </div>
                                <CommandButton iconProps={{iconName: 'Add'}} text="Add question" menuProps={menuProps} />
                            </Stack>
                            <Label className='login_label' styles={{root:{textAlign:'end'}}}>{errCreateJob['questions']}</Label>
                        </div>
                    }
                </div>



                <div style={{width:'100%'}} >
                    <div className='apply_job_title' onClick={()=>setviewQSection(previousState => !previousState)}>
                        <Stack horizontal className='apply_job_section' horizontalAlign='space-between'>
                            <div>
                                Question Set
                            </div>
                            <IconButton iconProps={viewQSection? ChevronUp: ChevronDown} 
                            title="Chevron" ariaLabel="Chevron" disabled={false}
                            />
                        </Stack>
                    </div>
                    { viewQSection && questionElement }
                </div>


                <div style={{padding: '40px', paddingRight:'15%', width: '100%', textAlign: 'right'}}>
                    <DefaultButton 
                        text={path === '/edit' ? 'Edit Job': 'Create Job'}
                        iconProps={{iconName:"TaskSolid"}}
                        styles={{root:{alignSelf:'end', borderColor: 'blue'}, label:{color:'blue', fontWeight:'bold'}}} 
                        onClick={createJob}
                    />                      
                </div>
            </Stack>


            <Dialog
                hidden={hideAddDialog}
                onDismiss={() => {sethideAddDialog(true); setaddQuestion(''); seterrAddQ('');}}
                dialogContentProps={{title: 'Add new ' }}
                modalProps={{isBlocking: false, dragOptions: dragOptions, styles:{ main: { width: 900 } }}}
            >
                <TextField 
                    label='New question'
                    type='text' 
                    onChange={e => setaddQuestion(e.target.value)} 
                    value={addQuestion}
                />
                <div style={{color:'red'}}>
                    {errAddQ}
                </div>
                <DialogFooter>
                <PrimaryButton onClick={addNewQuestion} text="Add" />
                <DefaultButton 
                    onClick={() => {sethideAddDialog(true); setaddQuestion(''); seterrAddQ('');}} 
                    text="Cancel" 
                />
                </DialogFooter>
            </Dialog>



            <Dialog
                hidden={hideSearchDialog}
                onDismiss={() => {sethideSearchDialog(true); setsearchQuestion('');}}
                dialogContentProps={{title: 'Search for a question' }}
                modalProps={{isBlocking: false, dragOptions: dragOptions, styles:{ main: { width: 900 } }}}
            >
                <TextField 
                    label='question' 
                    type='text' 
                    onChange={e => setsearchQuestion(e.target.value)} 
                    value={searchQuestion}
                />
                <DialogFooter>
                <PrimaryButton onClick={searchForQuestion} text="Search" />
                <DefaultButton onClick={() => {sethideSearchDialog(true); setsearchQuestion('');}} text="Cancel" />
                </DialogFooter>
            </Dialog>


            <Dialog
                hidden={hideChooseDialog}
                onDismiss={() => {sethideChooseDialog(true); setchooseQuestion({}); seterrChooseQ('');}}
                dialogContentProps={{title: 'Choose a question' }}
                modalProps={{isBlocking: false, dragOptions: dragOptions, styles:{ main: { width: 900 } }}}
            >
                <ComboBox 
                    label='choose question' 
                    options={questionsFromSearch} 
                    onChange={(e, option) => {setchooseQuestion(option); console.log(chooseQuestion)}} 
                />
                <div style={{color:'red'}}>
                    {errChooseQ}
                </div>
                <DialogFooter>
                <PrimaryButton onClick={addExistingQuestion} text="Add" />
                <DefaultButton onClick={() => {sethideChooseDialog(true); setchooseQuestion({}); seterrChooseQ('');}} text="Cancel" />
                </DialogFooter>
            </Dialog>
        </div>
    )
}

export default AddJob
