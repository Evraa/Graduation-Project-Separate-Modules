import { CommandBarButton, DetailsList, DetailsListLayoutMode, mergeStyleSets, SelectionMode, Stack, TextField, TooltipHost } from '@fluentui/react';
import React, {useEffect} from 'react'
import { useDispatch } from 'react-redux';
import { resetCurrentJob } from '../../../redux';
import { downloadUrl } from '../../../env'


function ViewJob() {

    const dispatch = useDispatch();


    const items = [
        {
            key: '1',
            name: 'kareem',
            appliedAt: '27/6/21',
            userPic: 'pictures/60f45a37c3deb2095ce85372.jpg',
            cvRank: 1,
            usr:{}
        },
        {
            key: '2',
            name: 'Evram',
            appliedAt: '28/6/21',
            userPic: 'pictures/60f9d733779ecc23a64d40ac.jpg',
            cvRank: 2,
            usr:{}
        },
        {
            key: '3',
            name: 'Omar',
            appliedAt: '29/6/21',
            userPic: 'pictures/60f9dbf9779ecc23a64d40b0.jpg',
            cvRank: 3,
            usr:{}
        },
        {
            key: '4',
            name: 'Sayed',
            appliedAt: '30/6/21',
            userPic: 'pictures/60f9e0d9779ecc23a64d40b1.jpg',
            cvRank: 4,
            usr:{}
        },
        {
            key: '5',
            name: 'Muhammed',
            appliedAt: '26/6/21',
            userPic: 'pictures/60f9dab9779ecc23a64d40ae.jpg',
            cvRank: 5,
            usr:{}
        },
        {
            key: '6',
            name: 'Khaled',
            appliedAt: '23/6/21',
            userPic: 'pictures/60f9d8f7779ecc23a64d40ad.jpg',
            cvRank: 6,
            usr:{}
        },
        {
            key: '7',
            name: 'Arthur',
            appliedAt: '21/6/21',
            userPic: 'pictures/60f9db8f779ecc23a64d40af.jpg',
            cvRank: 7,
            usr:{}
        },
        {
            key: '8',
            name: 'Osama',
            appliedAt: '22/6/21',
            userPic: 'pictures/60f1a612f76cec6506d42f57.jpg',
            cvRank: 8,
            usr:{}
        },
        {
            key: '9',
            name: 'Haytham',
            appliedAt: '22/5/21',
            userPic: 'pictures/60f1a612f76cec6506d42f57.jpg',
            cvRank: 9,
            usr:{}
        },
        {
            key: '10',
            name: 'Alaa',
            appliedAt: '27/5/21',
            userPic: 'pictures/60f1a612f76cec6506d42f57.jpg',
            cvRank: 10,
            usr:{}
        },
        {
            key: '11',
            name: 'Alice',
            appliedAt: '28/5/21',
            userPic: 'pictures/60f1a612f76cec6506d42f57.jpg',
            cvRank: 11,
            usr:{}
        },
        
    ]
      
  
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


    const columns = [
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
            isPadded: true,
        },
        {
            key:'cvrank',
            name:'CV Rank',
            fieldName: 'cvRank',
            minWidth: 70,
            maxWidth: 90,
            isResizable: true,
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
            onRender: () => (
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
                        },
                        {
                          key: 'viewapp',
                          name: 'View Application',
                        },
                        {
                          key: 'viewstats',
                          name: 'View Stats',
                        },
                      ]
                    }}
                />
            ),
        }
    ]

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
                    />
                </div>
                
                <DetailsList
                    items={items}
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
            

        </div>
    )
}

export default ViewJob
