import axios from "axios";

export async function get(url){
    return axios.get(url).then(res=>{
        // console.log(res)
        if(res.status === 200){
            return res.data
        }
        return res.data
    }).catch(function (error) {
        console.log(error);
    });
}

export async function getFromChainCatcher(){
    const cfg = {
        header:{
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "zh-CN,zh;q=0.9",
                "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "cookie": "PHPSESSID=igmlki0v623hqcfugofg2qq3c3; _ga=GA1.1.1044490744.1666074384; think_var=zh-cn; _ga_6MSXXZNH3G=GS1.1.1666151431.3.1.1666151481.0.0.0",
                "Referer": "https://www.chaincatcher.com/special",
                "Referrer-Policy": "strict-origin-when-cross-origin",
                "Access-Control-Allow-Origin": "*"
            }
        }
    }
    return axios.get("https://www.chaincatcher.com/", cfg).then(res=>{
        const txt = res.text()
        console.log(res)
    })
}