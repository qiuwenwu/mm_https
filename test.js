var Http = require('./index.js');
var fs = require("fs");

const apikey = "ed45043bc4da42e29d7618635ebb3499";

async function test2(content, from_user) {
	var hp = new Http();
	var pm = {
		"reqType": 0,
		"perception": {
			"inputText": {
				"text": content
			},
			"selfInfo": {
				"location": {
					"city": "深圳",
					"province": "广东",
					"street": "粤海街道"
				}
			}
		},
		"userInfo": {
			"apiKey": apikey,
			"userId": from_user
		}
	};
	//http://192.168.18.199:8000/test/hello
	var res = await hp.post("http://openapi.tuling123.com/openapi/api/v2", pm);
	console.log(res.body);
}
test2("真的", "we21lkjq3l");

// /// 测试
// async function test() {
// 	var hp = new Http();
// 	// var res = await hp.get("http://www.baidu.com");
// 	// console.log('百度:' + $.toJson(res));
// 	res = await hp.post("http://api.bitcentre.com.cn/login", {
// 		'phone': "15817188815",
// 		'password': "asd123"
// 	});
// 	// console.log('登录:' + $.toJson(res));
// 	var token = hp.cookie.get('x-auth-token').value;
// 	console.log('访问牌:' + token);
// 	console.log('cookie:', hp.cookie);
// 	res = await hp.get("http://api.bitcentre.com.cn/paper/id?id=1", {
// 		"x-auth-token": token
// 	});
// 	// console.log('结果:' + $.toJson(res));
// }

// async function test () {
// 	var hp = new Http();
// 	var res = await hp.get_fast('http://www.hao123.com');
// 	console.log(res.body);
// }

// async function test() {
// 	var hp = new Http();
// 	hp.encoding = "binary";
// 	var res = await hp.get('http://localhost:8080/dev/img/logo_gray.png');
// 	fs.writeFile("./logonew.png", res.binary, "binary", function(err) {
// 		if (err) {
// 			console.log("下载失败");
// 		}
// 		console.log("下载成功");
// 	});
// }
// test();
