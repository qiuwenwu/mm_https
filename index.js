/**
 * @fileOverview http请求帮助类函数
 * @author <a href="http://qww.elins.cn">邱文武</a>
 * @version 1.2
 */
const http = require('http');
const https = require('https');
const Url = require('url');
const HttpProxyAgent = require('https-proxy-agent');
const fs = require("fs");
const Cookie = require('./cookie');
const {
	unzipSync
} = require('zlib');
const iconv = require('iconv-lite');
const {
	hostname
} = require('os');
const {
	HttpsProxyAgent
} = require('https-proxy-agent');

class Http {
	constructor(config) {
		this.config = Object.assign({
			headers: "",
			rejectUnauthorized: false,
			cookie: "",
			proxy: null
			// proxy: "http://127.0.0.1:10809"
		}, config);

		/**
		 * cookies 缓存
		 */
		this.cookies = {};

		/**
		 * headers 协议头
		 */
		this.headers = {
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
			'Accept-Encoding': 'gzip, deflate',
			'Accept-Language': 'zh-CN,zh;q=0.9',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
		};

		if (this.config.cookie) {
			this.set_cookie(this.config.cookie);
		}
		
		if (this.config.headers) {
			var headers = this.change_headers(config.headers);
			Object.assign(this.headers, headers);
		}
	}
}

Http.prototype.set_cookie = function(cookieStr) {
	var arr = cookieStr.split('; ');
	var name;
	if (arr.length > 1) {
		for (var i = 0; i < arr.length; i++) {
			var kv = arr[i];
			var arr_kv = kv.split("=");
			name = arr_kv[0];
			this.cookies[name] = encodeURIComponent(arr_kv[1]);
		}
	}
}

Http.prototype.get_cookie = function() {
	var dist = this.cookies;
	var str = "";
	for (var k in dist) {
		str += "; " + k + "=" + dist[k];
	}
	var cookie = str.replace("; ", "");
	return cookie
}

/**
 * 转换协议头
 * @param {Object|String} headers 协议头
 */
Http.prototype.change_headers = function(headers) {
	if (headers) {
		if (typeof(headers) == "string") {
			if (headers.indexOf("{") === 0) {
				return headers.toJson();
			} else {
				var dict = {};
				var lines = headers.split('\n');
				for (var i = 0; i < lines.length; i++) {
					var line = lines[i].trim();
					if (line) {
						dict[line.left(":").trim()] = line.right(":").trim();
					}
				}
				return dict;
			}
		} else {
			return headers;
		}
	}
	return {}
}

Http.prototype.options = function(options) {
	return {
		href: "",
		method: "GET",
		body: {},
		proxy: "http://127.0.0.1:10809",
		headers: Object.assign({}, this.headers)
	}
}

Http.prototype.http_options = function(options) {
	var cg = this.config;
	var {
		href,
		body,
		headers,
		method,
		cookie,
		type
	} = options;
	var u = Url.parse(href, true);
	if (cookie) {
		this.set_cookie(cookie);
	}
	var host_protocol = href.left(":/") || 'http';
	return Object.assign({}, {
		host_protocol,
		body,
		type,
		method: method || "GET",
		headers: headers ? Object.assign({}, this.headers, headers) : Object.assign({}, this.headers),
		agent: cg.proxy ? new HttpProxyAgent(cg.proxy) : null,
		cookie: this.get_cookie()
	}, u);
}

// Http.prototype.http_options = function(options) {
// 	var cg = this.config;
// 	var {
// 		href,
// 		body,
// 		headers,
// 		method,
// 		cookie,
// 		type
// 	} = options;
// 	var protocol = href.left(":/") || 'http';
// 	// 移除协议头 取端口号
// 	var u = href.replace(protocol + "://", "");
// 	var port = u.between(":", "/") || u.left("/", true).right(":") || (protocol === 'http' ? 80 : 443);

// 	// 移除端口号，取主机地址
// 	u = u.replace(":" + port, "");
// 	var hostname = u.left("/", true).left("?", true);
// 	// 移除主机地址，取路由路径
// 	u = u.replace(hostname, "");
// 	var path = u.left("?", true);
// 	if (cookie) {
// 		this.set_cookie(cookie);
// 	}
// 	return {
// 		href,
// 		protocol,
// 		hostname,
// 		body,
// 		type,
// 		port: Number(port),
// 		search: "?" + u.right("?"),
// 		path: path.indexOf("/") === 0 ? path : "/" + path,
// 		method: method || "GET",
// 		headers: headers ? Object.assign({}, cg.headers, headers) : Object.assign({}, cg.headers),
// 		agent: cg.proxy ? new HttpProxyAgent(cg.proxy) : null,
// 		cookie: this.get_cookie()
// 	}
// }

Http.prototype.post_option = function(op) {
	var param = op.body;
	var body = "";
	var tp = typeof(param);
	var type = op.type;
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
	op.body = body;
	op.headers['Content-Type'] = type;
	op.headers['Content-Length'] = Buffer.byteLength(body);
}

/**
 * http请求
 * @param {Object} options 配置
 * @return {Object} 返回执行结果
 */
Http.prototype.req = async function(options) {
	var op = this.http_options(options);
	if (op.method.toLocaleUpperCase() === "POST") {
		this.post_option(op);
	}
	var res = await this.request(op);
	if (res.status.code == 302) {
		var url = res.headers.location;
		var lt = res.headers['set-cookie'];
		if (lt) {
			var len = lt.length;
			for (var i = 0; i < len; i++) {
				this.set_cookie(lt[i]);
			}
			options.href = url;
			op = this.http_options(options);
			op.referer = options.href;
			res = await this.request(op);
		}
	} else {
		return res;
	}
}

Http.prototype.undata = function(encoding) {
	var bufarr = [];
	var errored = false;
	var zpipe;
	if (encoding) {
		zpipe = zlib.createGunzip();
	} else {
		zpipe = zlib.createInflate();
	}
	zpipe.on('data', function(d) {
			bufarr.push(d);
		})
		.on('end', function() {
			if (errored) return;
			errored = true;
			cb(null, response, enc ? Buffer.concat(bufarr).toString(
				enc) : Buffer.concat(bufarr));
		})
		.on('error', function(err) {
			if (errored) return;
			errored = true;
			cb(err, response, null);
		});
	response.pipe(zpipe);
	response
		.on('error', function(err) {
			if (errored) return;
			errored = true;
			cb(err, response, null);
		});
}

/**
 * 请求
 * @param {Object} options 配置
 */
Http.prototype.request = function(options) {
	var hp = options.host_protocol === "https" ? https : http;
	var _this = this;
	return new Promise(function(resolve, reject) {
		var body = '';
		var req = hp.request(options, (res) => {
			var {
				headers
			} = res;

			if (res.statusCode == 200) {
				var chunks = [];
				var encoding = headers['content-encoding'];

				res.on('data', function(d) {
					chunks.push(d);
				}).on('end', function(de) {
					var buffer = Buffer.concat(chunks);
					switch (encoding) {
						case 'br':
						case 'gzip':
						case 'deflate':
							buffer = unzipSync(buffer);
							body = buffer.toString();
							break;
						default:
							body = buffer.toString();
							break;
					}
					var mh = body.match(/charset=(gb2312|GBK)"/i);
					if (mh) {
						body = iconv.decode(body, 'GBK');
					}
					var lt = headers['set-cookie'];
					if (lt) {
						var len = lt.length;
						for (var i = 0; i < len; i++) {
							_this.set_cookie(lt[i]);
						}
					}
					resolve({
						status: 200,
						headers,
						buffer,
						body
					});
				});
			} else {
				resolve({
					headers,
					status: {
						code: res.statusCode,
						message: res.statusMessage
					}
				});
				reject(res);
			}
		});

		req.on("error", function(err) {
			console.log("错误", err);
			resolve({
				status: 0,
				message: err.message
			});
			reject(err);
		});
		if (options.method.toLocaleUpperCase() == "POST") {
			req.write(options.body);
		}
		req.end();
	});
}

/**
 * @description GET请求
 * @param {String} url 请求地址
 * @param {Object} headers 请求头
 * @param {String} cookie 服务缓存
 * @return {Object} 响应的结果
 */
Http.prototype.get = async function(url, headers, cookie) {
	return await this.req({
		method: "GET",
		href: url,
		headers,
		cookie
	});
};


/**
 * @description POST提交
 * @param {String} url 请求地址
 * @param {Object} body 提交参
 * @param {Object} headers 请求头
 * @param {String} type 传参方式 json, form, text
 * @param {String} cookie 服务缓存
 * @return {Object} 响应的结果
 */
Http.prototype.post = async function(url, body, headers, type, cookie) {
	return await this.req({
		method: "POST",
		href: url,
		body,
		type,
		headers,
		cookie
	});
};

/**
 * @description 下载
 * @param {String} url 下载地址
 * @param {String} filename 下载地址
 * @param {String} auto 自动类型
 * @param {Object} headers 协议头
 * @param {String} cookie 服务缓存
 * @return {String} 成功返回保存路径，失败返回null
 */
Http.prototype.download = async function(url, filename, auto, headers, cookie) {
	var res = await this.get(url, headers, cookie);
	var file = null;
	if (res.body) {
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
				var type = content_type.replace("image/", "").replace("application/x-", "").replace("text/", "")
					.replace("audio/",
						"").replace("audio/", "").replace("jpeg", "jpg");
				file = filename + "." + type;
			}
		} else {
			file = filename;
		}
		if (file) {
			var length = await fs.writeFileSync(file, res.buffer, "binary");
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
	this.cookies = {};
};

if (global.$) {
	$.Http = Http;
}

/**
 * @description 导入构造函数
 */
module.exports = Http;