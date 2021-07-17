
export const getTime = (dateT) =>{
    const date = (new Date(dateT)).getTime();
    const curDate = (new Date(Date.now())).getTime();
    const diff = curDate- date;
    const inMillis = [1000, 60000, 3600000, 86400000, 604800000, 2629800000, 31557600000, 9155760000000];
    const timePeriods = ["just now" ,"second", "minute", "hour", "day", "week", "month", "year"];
    for(let i in inMillis){
        if(diff < inMillis[i]){
            if(i === 0){
                return timePeriods[i];
            }
            const dur = Math.floor(diff/inMillis[i-1]);
            if(dur === 1){
                return "1 " + timePeriods[i] + " ago"; 
            }
            else {
                return dur + " " + timePeriods[i] + "s ago"; 
            }
        }
    }
}