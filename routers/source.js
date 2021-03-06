//引入
import express from "express"
import Source from "./../models/Source"
import formidable from "formidable"
import {basename} from "path"
import config from "./../src/config"
const router = express.Router({});
/*******************************接口api-start***************************************/
/*往数据库中插入一条新纪录*/
router.post('/back/source/api/add', (req, res, next)=>{
    const form = new formidable.IncomingForm();
    form.uploadDir = config.uploadPath;  // 上传图片放置的文件夹
    form.keepExtensions = true; // 保持文件的原始扩展名
    form.parse(req, (err, fields, files)=>{
        if(err){
            return next(err);
        }
        // 1. 取出普通字段
        let body = fields;
        // 2. 解析上传的文件路径, 取出文件名保存到数据库
        body.small_img = basename(files.small_img.path);
        // 3. 操作数据库
        // 操作数据库
        const source = new Source({
            title: body.title,
            author: body.author,
            small_img: body.small_img,
            price: body.price,
            content: body.content,
        });
        source.save((err, result)=>{
            if(err){
                return next(err);
            }
            res.json({
                status: 200,
                result: '添加轮播图成功'
            })
        });
    });
});

/*图片上传到uploads文件夹*/
router.post('/back/source/api/add_img',(req,res,next)=>{
    const form = new formidable.IncomingForm();
    form.uploadDir = config.uploadPath;//上传图片放置的文件夹
    form.keepExtensions = true;//保持文件的原始扩展名
    form.parse(req,(err,fields,files)=>{
        if(err){
            return next(err);
        }
        if(files.image_url){//如果有值
            console.log(files.image_url.path);
            let image_url = "http://localhost:3040/uploads/"+basename(files.image_url.path);
            res.json({
                status:200,
                result:image_url
            })
        }else{
            res.json({
                status:1,
                result:"上传图片路径出现问题！"
            })
        }

    })

});

/*获取一篇文章(根据id）--模糊路径匹配 */
router.get("/back/source/api/single/:sourceId",(req,res,next)=>{
    Source.findById(req.params.sourceId,(error,docs)=>{
        if(error){
            return next(error);
        }
        //返回数据
        res.json({
            status:200,
            result:docs
        });
    });
});

/*根据id去修改一篇文章*/
router.post("/back/source/api/edit",(req,res,next)=>{
    const form = new formidable.IncomingForm();
    form.uploadDir = config.uploadPath;//上传图片放置的文件夹
    form.keepExtensions = true;//保持文件的原始扩展名
    form.parse(req,(err,fields,files)=>{
        if(err){
            return next(err);
        }
        //1.取出普通字段
        let body = fields;
        //2.根据id查询文档
        Source.findById(body.id,(err,source)=>{
            if(err){
                return next(err);
            }
            //2.1修改文档的内容
            source.title = body.title;
            source.author = body.author;
            source.small_img = body.small_img|| basename(files.small_img.path);
            source.price = body.price;
            source.content = body.content;
            //2.2保存
            source.save((err,result)=>{
                if(err){
                    return next(err);
                }
                res.json({
                    status:200,
                    result:"修改文章成功"
                });

            })
        });

    })
});

/*根据id删除一条记录**/
router.get("/back/source/api/remove/:sourceId",(req,res,next)=>{
    Source.deleteOne({_id:req.params.sourceId},(error,result)=>{
        if(error){
            return next(error);
        }
        // console.log(result);
        //返回数据
        res.json({
            status:200,
            result:"成功删除轮播图！"
        });
    });
});

/*获取总页数*/
router.get("/back/source/api/count",(req,res,next)=>{
    Source.countDocuments((error,count)=>{
        if(error){
            return next(error);
        }
        //返回数据
        res.json({
            status:200,
            result:count
        });
    });
});

/*获取列表页面数据*/
router.get("/back/source/api/list",(req,res,next)=>{
    //接收两个参数
    let page = Number.parseInt(req.query.page,10) || 1;//当前页
    let pageSize = Number.parseInt(req.query.pageSize,10) || 3;//每页显示几条数据
    //查询所有的数据 计算公式
    Source.find().skip((page-1)*pageSize).limit(pageSize).exec((err,sources)=>{
        if(err){
            return next(err);
        }
        res.json({
            status:200,
            result:sources
        });
    });
});

/*前台获取总记录数*/
router.get("/web/source/api/count",(req,res,next)=>{
    Source.countDocuments((error,count)=>{
        if(error){
            return next(error);
        }
        //返回数据
        res.json({
            status:200,
            result:count
        });
    });
});

/*前台获取资源列表*/
router.get("/web/source/api/list",(req,res,next)=>{
    //接收客户端传递的参数
    let {page,pageSize,sortBy} = req.query;
    page = Number.parseInt(page,10) || 1;//当前页
    pageSize = Number.parseInt(pageSize,10) || 100;//每页显示几条数据
    //数据查询规则
    let sortObj;
    if(sortBy === "price"){
        sortObj = {"price":-1}
    }else{//按照阅读量
        sortObj = {"read_count":-1}
    }
    //查询所有的数据 计算公式
    Source.find({},"title small_img price").sort(sortObj).skip((page-1)*pageSize).limit(pageSize).exec((err,sources)=>{
        if(err){
            return next(err);
        }
        res.json({
            status:200,
            result:sources
        });
    });
});

/*前台获取详情页数据*/
router.get("/web/source/api/content/:sourceId",(req,res,next)=>{
    //查询所有的数据 计算公式
    Source.findById(req.params.sourceId,"title author read_count add_time content",(err,source)=>{
        if(err){
            return next(err);
        }
        res.json({
            status:200,
            result:source
        });
    })
});

/*前端详情页阅读量处理*/
router.get("/web/source/api/content/read_count/:sourceId",(req,res,next)=>{
    //查询所有的数据 计算公式
    Source.findById(req.params.sourceId,"read_count",(err,source)=>{
        if(err){
            return next(err);
        }
        //1.取出要修改的数据
        source.read_count += 1;
        //2.保存
        source.save((err,result)=>{
            if(err){
                return next(err);
            }
            res.json({
                status:200,
                result:"阅读次数更新成功"
            });
        })
    })
});


/*******************************接口api-end***************************************/




/*******************************页面路由-start***************************************/

/*加载资源文章列表*/
// router.get("/back/source_list",(req,res,next)=>{
//     //查询所有的数据
//     Source.find((err,sources)=>{
//         if(err){
//             return next(err);
//         }
//         //sources,是接收到的数据。nunjuncks模板方式
//         res.render("back/source_list.html",{sources});
//     })
// });

// router.get("/back/source_list",(req,res,next)=>{
//     //接收两个参数
//     let page = Number(req.query.page,10) || 1;//当前页
//     let pageSize = Number(req.query.pageSize,10) || 3;//每页显示几条数据
//     //查询所有的数据 计算公式
//     Source.find().skip((page-1)*pageSize).limit(pageSize).exec((err,sources)=>{
//         if(err){
//             return next(err);
//         }
//         //查询数据库中总记录数 moongos方法
//         Source.countDocuments((err,count)=>{
//             if(err){
//                 return next(err);
//             }
//             //返回总页码
//             let totalPage = Math.ceil(count/pageSize);
//             //返回当前页码
//
//             //sources,是接收到的数据。nunjuncks模板方式
//             res.render("back/source_list.html",{sources,totalPage,page});
//         });
//     });
// });

router.get("/back/source_list",(req,res,next)=>{
    res.render("back/source_list.html");
});
/*加载添加资源文章列表*/
router.get("/back/source_add",(req,res,next)=>{
    res.render("back/source_add.html");
});

/*加载编辑文章页面*/
router.get("/back/source_edit",(req,res,next)=>{
    res.render("back/source_edit.html");
});

/*******************************页面路由-end***************************************/

//输出
export default router;
