import { Stack, IconButton, TextField, CommandButton,
        DialogFooter, ContextualMenu, Dialog,
        PrimaryButton, DefaultButton, ComboBox } from '@fluentui/react'
import { Toggle } from '@fluentui/react/lib/Toggle';
import React, { useState } from 'react'
import './addjob.css'

function AddJob() {

    const [key, setkey] = useState(0);

    const [reqVideo, setreqVideo] = useState(false);
    const [jobTitle, setjobTitle] = useState(false);
    const [jobDescription, setjobDescription] = useState(false);


    const [viewTitleSection, setviewTitleSection] = useState(false);
    const [viewDescriptionSection, setviewDescriptionSection] = useState(false);
    const [viewVideoSection, setviewVideoSection] = useState(false);
    const [viewQSection, setviewQSection] = useState(false);
    const [viewAddQSection, setviewAddQSection] = useState(false);

    const [hideAddDialog, sethideAddDialog] = useState(true);
    const [addQuestion, setaddQuestion] = useState("");

    const [hideSearchDialog, sethideSearchDialog] = useState(true);
    const [searchQuestion, setsearchQuestion] = useState("");

    const [hideChooseDialog, sethideChooseDialog] = useState(true);
    const [chooseQuestion, setchooseQuestion] = useState("");

    const [questionSet, setquestionSet] = useState([]);

    const questionsFromSearch = [
        {key: "1", text: "who"},
        {key: "2", text: "when"},
        {key: "3", text: "what"},
        {key: "4", text: "where"},
        {key: "5", text: "how"},
        {key: "6", text: "why"}
    ]


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

    const addNewQuestion = () => {
        // add in list of questions
        setkey(prev=>prev+1);
        setquestionSet(prev => [
            ...prev, {key:key, text: addQuestion, required: true}
        ]);
        sethideAddDialog(true); 
        setaddQuestion('');
    }

    const searchForQuestion = () => {
        sethideChooseDialog(false);
    }

    const addExistingQuestion = () => {
        console.log(chooseQuestion);
        setkey(prev=>prev+1);
        setquestionSet(prev => [
            ...prev, {key:key, text: chooseQuestion, required: true}
        ]);
        sethideChooseDialog(true);
        sethideSearchDialog(true);
        setsearchQuestion('');
        setchooseQuestion('');
    }

    const questionElement = 
    <Stack vertical tokens={{childrenGap: '20px'}} className='add_job_section_content'>
        {questionSet.map((value, index) =>
            <Stack horizontal horizontalAlign='space-between' className="add_job_question" key={questionSet[index].key}>
                <div style= {{width: '50%', textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'start'}}>
                    {questionSet[index].text}
                </div>
                <Toggle 
                    defaultChecked onText="required" offText="not required" 
                    onChange={(e, checked)=>setquestionSet(prev => { prev[index].required=checked; return prev})}
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
                    Add Job
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
                        <TextField 
                        label='Job Title'
                        type="text"
                        required
                        className='add_job_title_section_content'
                        styles={{root:{textAlign:'start'}}}
                        value={jobTitle}
                        onChange={(e) => setjobTitle(e.target.value)}/>
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
                        <TextField 
                        label='Job Description'
                        type="text"
                        required
                        multiline={true}
                        className='add_job_title_section_content'
                        styles={{root:{textAlign:'start'}}}
                        value={jobDescription}
                        onChange={(e) => setjobDescription(e.target.value)}/>
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
                                defaultChecked onText="On" offText="Off" 
                                onChange={(e, checked) => {setreqVideo(checked)}} 
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
                        <Stack horizontal horizontalAlign='space-between' className="add_job_section_content">
                            <div>
                                Add a question to job application
                            </div>
                            <CommandButton iconProps={{iconName: 'Add'}} text="Add question" menuProps={menuProps} />
                        </Stack>
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
                        text='Create Job' iconProps={{iconName:"TaskSolid"}}
                        styles={{root:{alignSelf:'end', borderColor: 'blue'}, label:{color:'blue', fontWeight:'bold'}}} 
                    />                      
                </div>
            </Stack>


            <Dialog
                hidden={hideAddDialog}
                onDismiss={() => {sethideAddDialog(true); setaddQuestion('');}}
                dialogContentProps={{title: 'Add new ' }}
                modalProps={{isBlocking: false, dragOptions: dragOptions, styles:{ main: { width: 900 } }}}
            >
                <TextField 
                    label='New question' 
                    type='text' 
                    onChange={e => setaddQuestion(e.target.value)} 
                    value={addQuestion}
                />
                <DialogFooter>
                <PrimaryButton onClick={addNewQuestion} text="Add" />
                <DefaultButton onClick={() => {sethideAddDialog(true); setaddQuestion('');}} text="Cancel" />
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
                onDismiss={() => {sethideChooseDialog(true); setchooseQuestion('');}}
                dialogContentProps={{title: 'Choose a question' }}
                modalProps={{isBlocking: false, dragOptions: dragOptions, styles:{ main: { width: 900 } }}}
            >
                <ComboBox 
                    label='choose question' 
                    options={questionsFromSearch} 
                    onChange={(e, option) => {setchooseQuestion(option.text); console.log(chooseQuestion)}} 
                />
                <DialogFooter>
                <PrimaryButton onClick={addExistingQuestion} text="Add" />
                <DefaultButton onClick={() => {sethideChooseDialog(true); setchooseQuestion('');}} text="Cancel" />
                </DialogFooter>
            </Dialog>
        </div>
    )
}

export default AddJob
