var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var crypto = require('crypto');
var model = require('../models/model');
var User = model.User;
var Article = model.Article;

/* GET home page. */

router.get('/', function(req, res, next) {
	var arts = '';

	Article.find({
		author: req.session.user.username
	}, function(err, articles) {
		if (err) {
			console.log('err');

		}

		//arts = articles;
		console.log('ats' + arts);
		return res.render('index', {
			title: '主页',
			success: req.flash('success').toString() || '',
			error: req.flash('error').toString() || '',
			user: req.session.user,
			arts: articles
		});

	});


});

module.exports = router;



//用户注册
router.get('/req', function(req, res, next) {
	res.render('register', {
		title: 'rester',
		success: req.flash('success').toString() || '',
		error: req.flash('error').toString() || '',
		user: req.session.user

	});
});

router.post('/req', function(req, res, next) {
	//req.body 处理 post 请求
	var username = req.body.username,
		password = req.body.password,
		passwordRepeat = req.body.passwordRepeat;
	if (password != passwordRepeat) {
		console.log('两次输入的密码不一致!');
		req.flash('error', "两次输入的密码不一致");
		return res.redirect('/req');

	}
	User.findOne({
		username: username
	}, function(err, user) {
		if (err) {
			console.log(err);
		}
		if (user) {
			console.log('用户名已经存在');
			req.flash('error', "用户名已经存在");
			return res.redirect('/req');
		}
		//对密码加密
		var md5 = crypto.createHash('md5'),
			md5password = md5.update(password).digest('hex');
		var newUser = new User({
			username: username,
			password: md5password,
			email: req.body.email
		});

		newUser.save(function(err, doc) {
			if (err) {
				console.log(err);
				return res.redirect('/req');
			}
			console.log('注册成功！');
			req.flash('success', "注册成功！");
			//newUser.password=null;
			//delete newUser.password;
			req.session.user = newUser;
			console.log('sessiom' + req.session.user);

			return res.redirect('/');
		})

	})
});


//用户登录
router.get('/login', function(req, res, next) {
	res.render('login', {
		title: 'login',
		success: req.flash('success').toString() || '',
		error: req.flash('error').toString() || '',
		user: req.session.user

	});
});
router.post('/login', function(req, res, next) {
	var username = req.body.username,
		password = req.body.password;
	var md5 = crypto.createHash('md5'),
		md5password = md5.update(password).digest('hex');
	User.find({
		username: username,
		password: md5password
	}, function(err, newuser) {
		if (err) {
			console.log('err');

		}
		if (newuser != '') {

			console.log(newuser);
			console.log('登录成功');
			req.flash('success', "登录成功！");


			req.session.user = newuser[0];
			console.log('sessiom' + req.session.user);
			return res.redirect('/');
		} else {
			console.log("用户或密码不正确");
			req.flash('error', "用户或密码不正确");
			return res.redirect('back');

		}
	})
})

//用户退出
router.get('/logout', function(req, res, next) {
		req.session.user = null;
		req.flash('success', "退出登录成功！");
		return res.redirect('/');
	})
	//用户发表文章
router.get('/post', function(req, res, next) {
	console.log('session' + req.session.user);
	res.render('post', {
		article: '',
		title: 'post',
		success: req.flash('success').toString() || '',
		error: req.flash('error').toString() || '',
		user: req.session.user

	});
});

//用户发表文章，提交
var id = '';
router.post('/post', function(req, res, next) {

		if (!id) {
			var data = new Article({
				title: req.body.title,
				author: req.session.user.username,
				tag: req.body.tag,
				content: req.body.content
			});
			data.save(function(err, doc) {
				if (err) {
					console.log(err);
					return res.redirect('/post');
				}
				console.log('文章发表成功！');
				req.flash('success', "文章发表成功！");
				return res.redirect('/');
			});

		} else {
			Article.update({
				_id: id
			}, {
				title: req.body.title,
				tag: req.body.tag,
				content: req.body.content,
				createTime: Date.now()
			}, function(err, article) {
				if (err) {
					console.log(err);
				}

				console.log(req.body.title);
				id = '';
				console.log('文章编辑成功！');
				req.flash('success', "文章编辑成功！");
				return res.redirect('/');
			});

		}
	})
	//用户编辑
router.get('/edit/:_id', function(req, res, next) {
	Article.findOne({
		_id: req.params._id
	}, function(err, article) {
		if (err) {
			console.log(err);
		}
		if (article) {
			id = req.params._id;

			console.log('editarticle'+article);
			return res.render('post', {
				article: article,
				title: 'post',
				success: req.flash('success').toString() || '',
				error: req.flash('error').toString() || '',
				user: req.session.user

			});
		}
	});
});

//删除文章
router.get('/remove/:_id', function(req, res, next) {
	//req.params 处理 /:xxx 形式的 get 或 post 请求，获取请求参数
	Article.remove({
		_id: req.params._id
	}, function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log('文章删除成功！');
			req.flash('success', "文章删除成功！");
		}
		return res.redirect('back');
	});
});