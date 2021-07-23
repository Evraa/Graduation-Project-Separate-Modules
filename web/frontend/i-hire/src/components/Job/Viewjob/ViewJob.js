import { CommandBarButton, DetailsList, DetailsListLayoutMode, Dialog, DialogFooter, mergeStyleSets, PrimaryButton, SelectionMode, Stack, TextField, TooltipHost } from '@fluentui/react';
import React, {useEffect} from 'react'
import { useDispatch } from 'react-redux';
import { resetCurrentJob } from '../../../redux';
import { downloadUrl } from '../../../env'
import { useState } from 'react';


function ViewJob() {

    const dispatch = useDispatch();


    const items = [
        {
            key: '1',
            name: 'kareem',
            appliedAt: '2021-07-23T00:10:38.791+00:00',
            userPic: 'pictures/60f45a37c3deb2095ce85372.jpg',
            cvRank: 1,
            usr:{
                analyzedPersonality: {
                    personality: "The Defender who's Protective, Warm and Caring"
                },
                analyzedVideo:{
                    results:[{
                        angry: "0.11447591",
                        disgust: "0.13745777",
                        scared: "0.14146577",
                        happy: "0.28353685",
                        sad: "0.07573782",
                        surprise: "0.078595325",
                        neutral: "0.16873056"
                    }]
                },
                id: "60f45a37c3deb2095ce85372"
            }
        },
        {
            key: '2',
            name: 'Evram',
            appliedAt: '2021-07-23T09:53:14.410+00:00',
            userPic: 'pictures/60f9d733779ecc23a64d40ac.jpg',
            cvRank: 2,
            usr:{}
        },
        {
            key: '3',
            name: 'Omar',
            appliedAt: '2021-07-22T23:48:53.716+00:00',
            userPic: 'pictures/60f9dbf9779ecc23a64d40b0.jpg',
            cvRank: 3,
            usr:{}
        },
        {
            key: '4',
            name: 'Sayed',
            appliedAt: '2021-07-22T23:48:53.716+00:00',
            userPic: 'pictures/60f9e0d9779ecc23a64d40b1.jpg',
            cvRank: 4,
            usr:{}
        },
        {
            key: '5',
            name: 'Muhammed',
            appliedAt: '2021-07-20T00:10:38.791+00:00',
            userPic: 'pictures/60f9dab9779ecc23a64d40ae.jpg',
            cvRank: 5,
            usr:{}
        },
        {
            key: '6',
            name: 'Khaled',
            appliedAt: '2021-07-19T00:10:38.791+00:00',
            userPic: 'pictures/60f9d8f7779ecc23a64d40ad.jpg',
            cvRank: 6,
            usr:{}
        },
        {
            key: '7',
            name: 'Arthur',
            appliedAt: '2021-07-18T00:10:38.791+00:00',
            userPic: 'pictures/60f9db8f779ecc23a64d40af.jpg',
            cvRank: 7,
            usr:{}
        },
        {
            key: '8',
            name: 'Osama',
            appliedAt: '2021-07-17T00:10:38.791+00:00',
            userPic: 'pictures/60f1a612f76cec6506d42f57.jpg',
            cvRank: 8,
            usr:{}
        },
        {
            key: '9',
            name: 'Haytham',
            appliedAt: '2021-07-16T00:10:38.791+00:00',
            userPic: 'pictures/60f1a612f76cec6506d42f57.jpg',
            cvRank: 9,
            usr:{}
        },
        {
            key: '10',
            name: 'Alaa',
            appliedAt: '2021-07-15T00:10:38.791+00:00',
            userPic: 'pictures/60f1a612f76cec6506d42f57.jpg',
            cvRank: 10,
            usr:{}
        },
        {
            key: '11',
            name: 'Alice',
            appliedAt: '2021-07-22T23:51:37.213+00:00',
            userPic: 'pictures/60f1a612f76cec6506d42f57.jpg',
            cvRank: 11,
            usr:{}
        },
        
    ]

    const [userDialogBox, setuserDialogBox] = useState(items[0].usr);
    const [hideDialog, sethideDialog] = useState(true)
    
    const [viewedItems, setviewedItems] = useState([...items]);
  
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
            onColumnClick: sortAppliedAt,
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
            onColumnClick: sortCVs,
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
                          onClick: () => {setuserDialogBox(item.usr)}
                        },
                        {
                          key: 'viewapp',
                          name: 'View Application',
                          onClick: () => {setuserDialogBox(item.usr)}
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


    const itemStyle = {fontSize: '25px'};
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
        return () => {
            dispatch(resetCurrentJob());
        }
    },[dispatch]);

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

        </div>
    )
}

export default ViewJob
