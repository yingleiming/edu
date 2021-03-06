import express from "express"
import Sowing from "./../models/Sowing"
import formidable from "formidable"
import {basename} from "path"
import config from "./../src/config"
const router = express.Router({});
import SowingController from "./../controller/sowing/SowingController"
/*******************************接口api***************************************/
/*
* 往数据库中插入一条数据
* */
router.post("/back/sowing/api/add",SowingController.insertOneSowing);

/*
* 获取所有的轮播图列表
*
* **/
router.get("/back/sowing/api/list",(req,res,next)=>{
    Sowing.find({},"_id image_title image_url image_link s_time e_time",(error,docs)=>{
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

/*
* 获取一条轮播图（根据id）--模糊路径匹配
* /sowing/api/single/:sowingId 模糊匹配
* /sowing/api/single/*
* /sowing/api/single/111
    千万不要
    /sowing/api/single/a/b
 */

router.get("/back/sowing/api/single/:sowingId",(req,res,next)=>{
    Sowing.findById(req.params.sowingId,"_id image_title image_url image_link s_time e_time",(error,docs)=>{
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

/**
 * 根据id去修改一条轮播图
 *
 * */
router.post("/back/sowing/api/edit",(req,res,next)=>{
    const form = new formidable.IncomingForm();
    form.uploadDir = config.uploadPath;//上传图片放置的文件夹
    form.keepExtensions = true;//保持文件的原始扩展名
    form.parse(req,(err,fields,files)=>{
        if(err){
            return next(err);
        }
        //1.取出普通字段
        let body = fields;
        // console.log(body);
        //2.根据id查询文档
        Sowing.findById(body.id,(err,sowing)=>{
            if(err){
                return next(err);
            }
            //2.1修改文档的内容
            // console.log(sowing);
            sowing.image_title = body.image_title;
            sowing.image_link = body.image_link;
            sowing.image_url = body.image_url|| basename(files.image_url.path);
            sowing.s_time = body.s_time;
            sowing.e_time = body.e_time;
            sowing.l_edit = Date.now();//最后编辑

            //2.2保存
            sowing.save((err,result)=>{
                if(err){
                    return next(err);
                }
                res.json({
                    status:200,
                    result:"修改轮播图成功"
                });

            })
        });

    })
});

/*根据id删除一条记录**/
router.get("/back/sowing/api/remove/:sowingId",(req,res,next)=>{
    Sowing.deleteOne({_id:req.params.sowingId},(error,result)=>{
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

/*******************************页面路由***************************************/

/*
* 加载轮播图列表
*
*  **/
router.get("/back/s_list",(req,res,next)=>{
    //查询所有的数据
    Sowing.find((err,sowings)=>{
        if(err){
            return next(err);
        }
        //sowings,是接收到的数据。nunjuncks模板方式
        res.render("back/sowing_list.html",{sowings});
    })
});

/*
* 加载添加轮播图
*
*  **/
router.get("/back/s_add",(req,res,next)=>{
    res.render("back/sowing_add.html");
});

/*
* 加载修改轮播图
*
*  **/
router.get("/back/s_edit",(req,res,next)=>{
    res.render("back/sowing_edit.html");
});


export default router;
