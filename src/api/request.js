import axios from "axios";

export function get(url){
    axios.get(url).then(res=>{
        return res.data
    }).catch(function (error) {
        console.log(error);
    });
}