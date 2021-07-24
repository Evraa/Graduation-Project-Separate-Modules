import { CommandBarButton, DetailsList, DetailsListLayoutMode, Dialog, DialogFooter, mergeStyleSets, PrimaryButton, SelectionMode, Stack, TextField, TooltipHost } from '@fluentui/react';
import React, {useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { resetCurrentJob } from '../../../redux';
import { downloadUrl, baseUrl } from '../../../env'
import { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import ViewApplication from '../ViewApplication/ViewApplication';


function ViewJob() {

    const dispatch = useDispatch();

    const {id} = useParams();
    const currentUser = useSelector(state => state.currentUser);
    const token = currentUser.token;

    const history = useHistory();


    const [items, setitems] = useState([]);

    const [userDialogBox, setuserDialogBox] = useState({});
    const [hideDialog, sethideDialog] = useState(true);
    const [hideAppDailog, sethideAppDailog] = useState(true);
    
    const [viewedItems, setviewedItems] = useState([]);
  
    const classNames = mergeStyleSets({
        fileIconHeaderIcon: {
            paddingLeft: '39px',
            fontSize: '20px',
        },
        fileIconCell: {
            textAlign: 'center',
            selectors: {
                '&:before': {
                    content: '.',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    height: '100%',
                    width: '100px',
                },
          },
        },
        fileIconImg: {
            verticalAlign: 'middle',
            height: '50px',
            width: '50px',
            borderRadius:'50%',
        },
        controlWrapper: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        exampleToggle: {
            display: 'inline-block',
            marginBottom: '10px',
            marginRight: '30px',
        },
        selectionDetails: {
            marginBottom: '20px',
        },
    });


    const sortAppliedAt = () => {
        const newItems = [...viewedItems];
        console.log(items);
        
        newItems.sort((a,b) => {
            const aDate = new Date(a.appliedAt);
            const bDate = new Date(b.appliedAt);
            return columns[2].isSortedDescending? bDate - aDate : aDate - bDate;
        })
        setviewedItems([...newItems]);
        const newcol = [...columns];
        newcol[2].isSorted = true;
        newcol[2].isSortedDescending = !newcol[2].isSortedDescending;
        setcolumns(newcol);
    }
    

    const sortCVs = () => {
        const newItems = [...viewedItems];
        console.log(items);
        
        newItems.sort((a,b) => {
            return columns[3].isSortedDescending? b.cvRank - a.cvRank: a.cvRank - b.cvRank;
        })
        setviewedItems([...newItems]);
        const newcol = [...columns];
        newcol[3].isSorted = true;
        newcol[3].isSortedDescending = newcol[3].isSortedDescending? false: true;
        setcolumns(newcol);
    }
    

    const [columns, setcolumns] = useState([
        {
            key:'userpic',
            name:'Profile Picture',
            className: classNames.fileIconCell,
            iconClassName: classNames.fileIconHeaderIcon,
            iconName: 'ContactList',
            isIconOnly: true,
            maxWidth: 40,
            fieldName: 'userPic',
            onRender: (item) => (
                item.userPic && <img src={downloadUrl + item.userPic} className={classNames.fileIconImg} alt='user profile' />
              ),
        },
        {
            key:'username',
            name:'Name',
            fieldName: 'name',
            minWidth: 210,
            maxWidth: 350,
            isRowHeader: true,
            isResizable: true,
            data: 'string',
            isPadded: true,
        },
        {
            key:'appliedat',
            name:'Applied at',
            fieldName: 'appliedAt',
            minWidth: 70,
            maxWidth: 90,
            isResizable: true,
            data: 'number',
            sortAscendingAriaLabel: 'Sorted A to Z',
            sortDescendingAriaLabel: 'Sorted Z to A',
            isPadded: true,
            onRender: (item) => {
                const date = new Date(item.appliedAt);
                const dateStr = date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
                return (
                    <div>
                        {dateStr}
                    </div>
                )
            }
            
        },
        {
            key:'cvrank',
            name:'CV Rank',
            fieldName: 'cvRank',
            minWidth: 70,
            maxWidth: 90,
            isResizable: true,
            sortAscendingAriaLabel: 'Sorted A to Z',
            sortDescendingAriaLabel: 'Sorted Z to A',
            isSorted: true,
            isSortedDescending: true,
            data: 'number',
            isPadded: true,
        },
        {
            key:'overflowbut',
            name:'View',
            minWidth: 50,
            maxWidth: 70,
            isResizable: true,
            fieldName: 'usr',
            onRender: (item) => (
                <CommandBarButton
                    role="menuitem"
                    aria-label="View"
                    styles={{
                        root: { padding: '10px' },
                        menuIcon: { fontSize: '16px' },
                    }}
                    menuIconProps={{ iconName: 'More' }}
                    menuProps={{ items: [
                        {
                          key: 'viewprofile',
                          name: 'View Profile',
                          onClick: () => {setuserDialogBox(item.usr); history.push('/profile/' + item.usr.id)}
                        },
                        {
                          key: 'viewapp',
                          name: 'View Application',
                          onClick: () => {setuserDialogBox(item.usr); sethideAppDailog(false);}
                        },
                        {
                          key: 'viewstats',
                          name: 'View Stats',
                          onClick: () => {setuserDialogBox(item.usr); sethideDialog(false);}
                        },
                      ]
                    }}
                />
            ),
        }
    ]);

    const filterNames = (text) => {
        console.log('filter');
        var newItems = [...items];
        if(text){
            newItems = items.filter(i => i.name.toLowerCase().indexOf(text) > -1);
        }
        setviewedItems([...newItems])
    }


    const itemStyle = {fontSize: '25px', color: 'red'};
    const itemContentStyle = {fontSize: '18px', paddingTop: '4px'};

    const getTopEmotions = () => {
        
        const data = userDialogBox.analyzedVideo.results[0];
        var sortable = [];
        var ret = "";
        for (var v in data) {
            sortable.push([v, data[v]]);
        }

        sortable.sort(function(a, b) {
            return b[1] - a[1];
        });
        for(var x = 0; x < sortable.length && x < 3; x+=1){
            ret = ret + sortable[x][0] + "  ";
        }
        return ret;

    }


    useEffect(()=>{
        console.log(window.location.pathname);
        console.log(window.location.href);
        const sleep = (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        const fetchData = async() => {
            try {
                const res1 = await fetch('http://localhost:3002/api/job/'+id+'/analyzeResumes', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });

                const data1 = await res1.json();
                console.log(data1);
                if(data1.msg === "No resumes for this job"){
                    alert('No applicants found in this job');
                    history.push('/');
                    return;
                }
                var data;
                var itr = 0;
                do{
                    const res = await fetch('http://localhost:3002/api/job/'+id+'/rankedApplicants', {
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    });
                    data = await res.json();
                    await sleep(200);
                    console.log(data);
                    itr += 1;
                }while(!data.users && itr < 3);

                if(!data.users){
                    alert('job resumes are being processed');
                    history.push('/');
                    return;
                }

                console.log(data);
                const users = data.users;
                const stitems = [];
                for(var i = 0; i < users.length; i += 1){
                    const itm = {};
                    const us = {};
                    itm.key = users[i].data._id;
                    itm.name = users[i].data.name;
                    itm.userPic = users[i].data.picture;
                    itm.cvRank = i+1;
                    itm.appliedAt = users[i].application[0].createdAt;
                    us.analyzedPersonality = users[i].application[0].analyzedPersonality;
                    us.analyzedVideo = users[i].application[0].analyzedVideo;
                    us.id = users[i].data._id;
                    us.appid = users[i].application[0]._id;
                    itm.usr = us;
                    stitems.push(itm);
                }
                setitems([...stitems]);
                setviewedItems([...stitems]);
            } catch (error) {
                console.log(error);
            }
        }
        fetchData();
        return () => {
            dispatch(resetCurrentJob());
        }
    },[dispatch, history, id, token]);

    return (
        <div className='homepage_main' >
            <div style={{paddingLeft:'15%', paddingRight: '15%'}}>
                <div style={{paddingBottom: '40px', textAlign:'start', width: '30%', paddingLeft: '40px'}}>
                    <TextField
                        label='Filter by name'
                        onChange={e => filterNames(e.target.value)}
                    />
                </div>
                
                <DetailsList
                    items={viewedItems}
                    columns={columns}
                    selectionMode={SelectionMode.none}
                    getKey={(item)=>item.key}
                    setKey="none"
                    layoutMode={DetailsListLayoutMode.justified}
                    isHeaderVisible={true}
                    styles={{root:{
                        overflowY: 'auto', height: '700px', overflowX: 'hidden'
                    }}}
                    onColumnHeaderClick={(e, c) => {
                        if (c.key === 'cvrank')
                        {
                            sortCVs();
                        }
                        else if(c.key === 'appliedat'){
                            sortAppliedAt();
                        }
                    }}
                />

            </div>
            
            <Dialog
                hidden={hideDialog}
                onDismiss={() => sethideDialog(true)}
                dialogContentProps={{title: 'View Statistics' }}
                modalProps={{isBlocking: true, styles:{ main: { width: 900 } }}}
                containerClassName={ 'ms-Dialog-main dialogStyle'}
            >

                <Stack vertical tokens={{childrenGap:50}}>
                    {
                        userDialogBox.analyzedVideo &&
                        <Stack horizontal horizontalAlign='space-between' tokens={{childrenGap:40}}>
                            <div style={itemStyle}> Emotion Detection </div>
                            <div style={itemContentStyle} > {getTopEmotions()} </div>
                        </Stack>
                    }

                    {
                        userDialogBox.analyzedPersonality &&
                        <Stack horizontal horizontalAlign='space-between' tokens={{childrenGap:40}}>
                            <div style={itemStyle}> Behavioral Analysis </div>
                            <div style={itemContentStyle} > {userDialogBox.analyzedPersonality.personality} </div>
                        </Stack>
                    }

                </Stack>

                <DialogFooter>
                    <PrimaryButton onClick={() => sethideDialog(true)} text="ok" />
                </DialogFooter>

            </Dialog>
            <ViewApplication 
                appID={userDialogBox.appid} hideDialog={hideAppDailog} 
                sethideDialog={sethideAppDailog} 
            />

        </div>
    )
}

export default ViewJob
