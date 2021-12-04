/**
 * @fileOverview http请求帮助类函数
 * @author <a href="http://qww.elins.cn">邱文武</a>
 * @version 1.2
 */
const fs = require("fs");
const Cookie = require('./cookie');
const {
	gunzip,
	inflate
} = require('zlib');
const http = require('http');
const https = require('https');
const iconv = require('iconv-lite');

/**
 * @description 获取参数项
 * @param {String} url 网址
 * @return {Object} http参数对象
 */
function getInfo(url) {
	var host = url.between("//", "/", true);
	var path = "/" + url.replace("//").right("/");
	var index = host.indexOf(':');
	var port;

	if (index !== -1) {
		port = host.substr(index + 1);
		host = host.substr(0, index);
	} else {
		if (url.indexOf('https') !== -1) {
			port = 443;
		} else {
			port = 80;
		}
	}
	return {
		host: host,
		port: port,
		path: path
	}
}

/**
 * http类函数
 */
class Http {
	/**
	 * 构造函数
	 * @constructor
	 * @param {Object} config 配置参数
	 */
	constructor(config) {
		/**
		 * 存储上次请求
		 */
		this.referer = "";
		/**
		 * 设置cookie存储
		 */
		this.cookie = new Cookie();

		/**
		 * 获取的编码方式
		 */
		this.encoding = 'utf-8';

		this.config = Object.assign({
			headers: {
				'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
				'accept-encoding': 'gzip, deflate',
				'accept-language': 'zh-CN,zh;q=0.9',
				'cache-control': 'max-age=0',
				'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
				'sec-ch-ua-mobile': '?0',
				'sec-ch-ua-platform': '"Windows"',
				'sec-fetch-dest': 'document',
				'sec-fetch-mode': 'navigate',
				'sec-fetch-site': 'none',
				'sec-fetch-user': '?1',
				'upgrade-insecure-requests': '1',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36'
			},
			rejectUnauthorized: false
		}, config)
	}
}

/**
 * @description 删除cookie
 * @param {String} name 名称
 * @param {String} path 路径
 * @param {String} domain 域名
 */
Http.prototype.delCookie = function(name, path, domain) {
	if (domain) {
		this.list.del({
			name: name,
			path: path,
			domain: domain
		});
	} else if (path) {
		this.list.del({
			name: name,
			path: path
		});
	} else {
		this.list.del({
			name: name
		});
	}
};

/**
 * @description 初始化选项
 * @param {String} method 请求方式
 * @param {String} url 请求地址
 * @param {Object} cookie 缓存
 * @return {Object} 配置参数
 */
Http.prototype.option = function(method, url, cookie) {
	var {
		host,
		port,
		path
	} = getInfo(url);
	var op = Object.assign({}, this.config, {
		url: url,
		hostname: host,
		path: path,
		port: port,
		method: method
	});
	if (cookie) {
		op.cookie = cookie;
	} else if (this.cookie) {
		op.cookie = this.cookie.str();
	}
	if (this.referer) {
		op.Referer = this.referer;
	}
	return op;
};

/**
 * http请求
 * @param {Object} options 请求配置
 * @param {Object} param 请求参数
 * @return {Promise|Object} 请求的结果
 */
Http.prototype.req = function(options, param) {
	return new Promise((resolve, reject) => {
		var hp;
		var url = options.url;
		if (url && url.indexOf('https') !== -1) {
			hp = https;
		} else {
			hp = http;
		}
		var req = hp.request(options, function(res) {
			var code = res.statusCode;
			if (code === 200) {
				var chunks = [];
				var encoding = res.headers['content-encoding'];
				// 非gzip/deflate要转成utf-8格式
				if (encoding === 'undefined') {
					res.setEncoding(this.encoding);
				}
				res.on('data', function(chunk) {
					chunks.push(chunk);
				});
				res.on('end', function() {
					var buffer = Buffer.concat(chunks);
					if (encoding === 'gzip') {
						gunzip(buffer, function(err, decoded) {
							if (err) {
								reject(err);
							} else {
								var body = decoded.toString();
								var mh = body.match(/charset=(gb2312|GBK)"/i);
								if (mh) {
									body = iconv.decode(decoded, 'GBK');
								}
								resolve({
									headers: res.headers,
									binary: decoded,
									body: body
								});
							}
						});
					} else if (encoding === 'deflate') {
						inflate(buffer, function(err, decoded) {
							if (err) {
								reject(err);
							} else {
								var body = decoded.toString();
								var mh = body.match(/charset=(gb2312|GBK)"/i);
								if (mh) {
									body = iconv.decode(decoded, 'GBK');
								}
								resolve({
									headers: res.headers,
									binary: decoded,
									body: body
								});
							}
						});
					} else {
						var body = buffer.toString();
						var mh = body.match(/charset=(gb2312|GBK)"/i);
						if (mh) {
							body = iconv.decode(buffer, 'GBK');
						}
						resolve({
							headers: res.headers,
							binary: buffer,
							body: body
						});
					}
				});
			} else {
				resolve({
					status: code,
					message: res.statusMessage,
					headers: res.headers
				});
			}
		});
		if (param) {
			req.write(param);
		}
		req.on("error", function(err) {
			resolve({
				status: 0,
				message: err.message
			});
		});
		req.end();
	});
};

/**
 * @description 执行http请求
 * @param {Object} options 配置参数
 * @param {Object} param 传递参数
 * @return {Object} 执行结果
 */
Http.prototype.run = async function(options, param) {
	var res = await this.req(options, param);
	if (res) {
		if (res.status === 302) {
			var url = res.headers.location;
			var op = this.option(options.method, url);
			res = await this.req(op, param);
			if (res.status === 302) {
				var url = res.headers.location;
				op = this.option(options.method, url);
				res = await this.req(op, param);
			}
		}
		var hd = res.headers;
		if (hd) {
			var lt = hd['set-cookie'];
			if (lt) {
				var len = lt.length;
				for (var i = 0; i < len; i++) {
					this.cookie.str(lt[i]);
				}
			}
			this.referer = options.url;
		}
	}
	return res;
};

/**
 * @description 执行http请求 —— 快速
 * @param {Object} options 配置参数
 * @param {Object} param 传递参数
 * @return {Object} 执行结果
 */
Http.prototype.run_fast = async function(options, param) {
	var res = await this.req(options, param);
	if (res) {
		if (res.status === 302) {
			var url = res.headers.location;
			var op = this.option(options.method, url);
			res = await this.req(op, param);
			if (res.status === 302) {
				var url = res.headers.location;
				op = this.option(options.method, url);
				res = await this.req(op, param);
			}
		}
	}
	return res;
};

/**
 * @description GET请求
 * @param {String} url 请求地址
 * @param {Object} headers 请求头
 * @param {Object} cookie 服务缓存
 * @return {Object} 请求的结果
 */
Http.prototype.get = async function(url, headers, cookie) {
	var op = this.option('GET', url, cookie);
	$.push(op.headers, headers, true);
	return await this.run(op);
};

/**
 * @description GET请求 —— 快速
 * @param {String} url 请求地址
 * @return {Object} 请求的结果
 */
Http.prototype.get_fast = async function(url) {
	var op = this.option('GET', url, {});
	return await this.run_fast(op);
};

/**
 * @description POST请求
 * @param {String} url 请求地址
 * @param {Object} param 正文参数
 * @param {Object} headers 请求头
 * @param {String} type 请求类型
 * @param {String} cookie Cookie缓存
 * @return {Object} 请求的结果
 */
Http.prototype.post = async function(url, param, headers, type, cookie) {
	var body = "";
	var tp = typeof(param);
	if (tp === "object") {
		if (!type) {
			type = 'application/json; charset=UTF-8';
		} else if (type.indexOf('json') !== -1) {
			type = "application/json; charset=UTF-8";
		} else if (type.indexOf('html') !== -1) {
			type = "text/html; charset=UTF-8";
		} else if (type.indexOf('form') !== -1) {
			type = "application/x-www-form-urlencoded; charset=UTF-8";
		} else {
			type = "text/plain; charset=UTF-8";
		}
		if (type.indexOf('/json') !== -1) {
			body = JSON.stringify(param);
		} else if (type.indexOf('form') !== -1) {
			body = $.toUrl(param);
		} else {
			body = $.toXml(param);
		}
	} else {
		body = param.trim();
		if (!type) {
			if (body.startWith('{') && body.endWith('}')) {
				type = "application/json; charset=UTF-8";
			} else if (body.startWith('[') && body.endWith(']')) {
				type = "application/json; charset=UTF-8";
			} else if (body.indexOf("<html>") !== -1) {
				type = "text/html";
			} else {
				type = "text/plain; charset=UTF-8";
			}
		}
	}
	var op = this.option('POST', url, cookie);
	op.body = body;
	op.headers['Content-Type'] = type;
	op.headers['Content-Length'] = Buffer.byteLength(body);
	$.push(op.headers, headers, true);
	return await this.run(op, body);
};

/**
 * @description POST请求 —— 快速
 * @param {String} url 请求地址
 * @param {String} body 正文参数
 * @param {String} type 请求类型
 * @return {Object} 请求的结果
 */
Http.prototype.post_fast = async function(url, body, type) {
	var op = this.option('POST', url, {});
	op.body = body;
	if (!type) {
		type = "application/json; charset=UTF-8";
	}
	op.headers['Content-Type'] = type;
	op.headers['Content-Length'] = Buffer.byteLength(body);
	return await this.run_fast(op, body);
};

/**
 * @description 下载
 * @param {String} url 下载地址
 * @param {String} filename 下载地址
 * @param {String} auto 自动类型
 * @param {Object} headers 协议头
 * @param {Object} cookie COOKIE
 * @return {String} 成功返回保存路径，失败返回null
 */
Http.prototype.download = async function(url, filename, auto, headers, cookie) {
	this.encoding = "binary";
	var res = await this.get(url, headers, cookie);
	var file = null;
	if (res.binary) {
		if (auto) {
			var arr = url.split('/');
			var fullname = arr[arr.length - 1];
			if (fullname.indexOf('.') !== -1) {
				var type = fullname.right('.');
				if (type) {
					file = filename + "." + type;
				}
			} else {
				var content_type = res.headers["content-type"];
				var type = content_type.replace("image/", "").replace("application/x-", "").replace("text/", "").replace("audio/",
					"").replace("audio/", "").replace("jpeg", "jpg");
				file = filename + "." + type;
			}
		} else {
			file = filename;
		}
		if (file) {
			var length = await fs.writeFileSync(file, res.binary, "binary");
			if (length == 0) {
				file = null;
			}
		} else {
			console.log('保存文件名(filename)不能为!');
		}
	}
	return file;
};

/**
 * 清除缓存
 */
Http.prototype.clear = function() {
	this.cookie.list.clear();
	this.headers = [];
};

if (global.$) {
	$.Http = Http;
}

/**
 * @description 导入构造函数
 */
module.exports = Http;
