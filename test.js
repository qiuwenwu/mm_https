// const nJwt = require('njwt');
var Http = require('./index.js');
var fs = require("fs");

// async function test3() {
// 	// 将「微信对话开放平台」得到的信息填入
// 	var APPID = "xxx";
// 	var TOKEN = "xxx";
// 	var EncodingAESKey = "xxx";

// 	var claims = {
// 		"username": "username",
// 		"msg": "有什么好听的歌曲?"
// 	};
// 	var jwt = nJwt.create(claims, EncodingAESKey, "HS256");
// 	var token = jwt.compact();

// 	var hp = new Http();
// 	var pm = {
// 		query: token
// 	};
// 	var res = await hp.post('https://openai.weixin.qq.com/openapi/message/' + TOKEN, pm);
// 	console.log(res.message, res.body)
// }
// test3();


// async function test2(content, from_user) {.
// 图灵机器人
//	const apikey = "xxx";
// 	var hp = new Http();
// 	var pm = {
// 		"reqType": 0,
// 		"perception": {
// 			"inputText": {
// 				"text": content
// 			},
// 			"selfInfo": {
// 				"location": {
// 					"city": "深圳",
// 					"province": "广东",
// 					"street": "粤海街道"
// 				}
// 			}
// 		},
// 		"userInfo": {
// 			"apiKey": apikey,
// 			"userId": from_user
// 		}
// 	};
// 	//http://192.168.18.199:8000/test/hello
// 	var res = await hp.post("http://openapi.tuling123.com/openapi/api/v2", pm);
// 	console.log(res.body);
// }
// test2("真的", "we21lkjq3l");


// // 测试
// async function test() {
// 	var hp = new Http({
// 		proxy: "http://127.0.0.1:10809"
// 	});
// 	res = await hp.post("https://accounts.binance.com/bapi/accounts/v2/public/authcenter/login", {
// 		'phone': "15817188815",
// 		'password': "asd123"
// 	}, null, 'form');
// 	var token = hp.cookies['x-auth-token'];
// 	// res = await hp.get("http://api.bitcentre.com.cn/paper/id?id=1", {
// 	// 	"x-auth-token": token
// 	// });
	
// 	// res = await hp.get("https://www.google.com");
// 	console.log('结果:', res);
// 	console.log('结果:', hp.cookies);
// }

// 测试
// async function test() {
// 	var hp = new Http();
// 	// var res = await hp.get("http://www.baidu.com");
// 	// console.log('百度:' + JSON.stringify(res));
// 	res = await hp.post("http://127.0.0.1:8000/login", {
// 		'phone': "15817188815",
// 		'password': "asd123"
// 	}, null, 'json');
// 	console.log('登录:' + JSON.stringify(res));
// 	var token = hp.cookies['x-auth-token'];
// 	console.log('访问牌:' + token);
// 	// res = await hp.get("http://127.0.0.1:8000/paper/id?id=1", {
// 	// 	"x-auth-token": token || ""
// 	// });
// 	// console.log('结果:' + JSON.stringify(res));
// 	// console.log('结果:', hp.cookies);
// }

// async function test () {
// 	var hp = new Http();
// 	var res = await hp.get_fast('http://www.hao123.com');
// 	console.log(res.body);
// }

// async function test() {
// 	var hp = new Http();
// 	var res = await hp.get('http://localhost:8080/dev/img/logo_gray.png');
// 	console.log(res);
// 	fs.writeFile("./logonew.png", res.body, "binary", function(err) {
// 		if (err) {
// 			console.log("下载失败");
// 		}
// 		console.log("下载成功");
// 	});
// }


// async function test () {
// 	var hp = new Http();
// 	// var url = "http://vip.stock.finance.sina.com.cn/corp/view/vRPD_NewStockIssue.php?page=1&cngem=0&orderBy=NetDate&orderType=desc";
// 	var url = "http://www.sccnn.com/gaojingtuku/jierisucai/jianjunjie/20200724-264416.html";
// 	var res = await hp.get(url);
// 	console.log(res);
// }
// test();


// async function download(){
// 	var hp = new Http();
// 	// var url = "http://www.haoduoma.com/d/file/p/2021-06-18/76df67e451ca9dec9991588ad7fda6e6.jpg";
// 	var url = "https://www.copipi.com/p/224/224/becce1fc21d723614b598f5377d5d676.jpg";
// 	"./二维码/中文".addDir();
// 	var filename = "./二维码/你好.jpg".fullname();
// 	var file = await hp.download(url, filename);
// 	console.log(file);
// }
// download();

// async function test() {
// 	var http = new Http();
// 	console.log("开始请求");
// 	var options = http.new_options({
// 		url: "http://www.hao123.com:8000/test?dd=123"
// 	});
// 	console.log(1, options);

// 	options = http.new_options({
// 		url: "www.hao123.com:8000/test?dd=123"
// 	});
// 	console.log(2, options);

// 	options = http.new_options({
// 		url: "www.hao123.com/test?dd=123"
// 	});
// 	console.log(3, options);

// 	var options = http.new_options({
// 		url: "http://www.hao123.com/test?dd=123"
// 	});
// 	console.log(4, options);
	
// 	var options = http.new_options({
// 		url: "http://www.hao123.com"
// 	});
// 	console.log(5, options);
	
// 	options = http.new_options({
// 		url: "https://www.hao123.com:8000"
// 	});
// 	console.log(6, options);
	
// 	options = http.new_options({
// 		url: "https://www.hao123.com?dd=123"
// 	});
// 	console.log(6, options);
// }

// async function test() {
// 	var http = new Http();
// 	var res = await http.get("https://www.hao123.com");
// 	console.log("结果", res.body);
// 	var res = await http.download('http://www.51sjk.com/Upload/Articles/1/0/8/8799_20200415005654483_0.jpg', "./demo.jpg");
// 	// console.log(res);
	
// 	// console.log("代理请求");
// 	// var http = new Http({
// 	// 	proxy: "http://127.0.0.1:10809"
// 	// });
// 	// var res = await http.get("https://www.binance.com/bapi/nft/v1/friendly/nft/nft-asset/asset-detail?nftInfoId=31849573");
// 	// console.log("结果", res.body);
// }

// test();
