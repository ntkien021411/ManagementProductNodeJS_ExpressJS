const Product = require("../../models/product.model");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system");
const ProductCategory = require("../../models/product-category.model");
const createTreeCategory = require("../../helpers/createTreeCategory");
const Account = require("../../models/account.model");
// [GET] /admin/products
module.exports.index = async (req, res) => {
  //Nút bấm lọc trạng thái của product
  let filterStatus = filterStatusHelper(req.query);

  //OBJECT BỘ LỌC VÀ TÌM KIẾM data TRONG MONGODB
  let find = {
    deleted: false,
  };

  //BỘ LỌC TRẠNG THÁI SẢN PHẨM
  //http://localhost:3000/admin/products?keyword=Iphone
  if (req.query.status) {
    find.status = req.query.status;
  }

  //TÌM KIẾM SẢN PHẨM THEO TITLE
  let objectSearch = searchHelper(req.query);
  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }

  //Total Page :
  let countProducts = await Product.countDocuments(find);
  //PAGINATION
  let objectPagination = paginationHelper(
    req.query,
    {
      limitItem: 4,
      currentPage: 1,
    },
    countProducts
  );

  //SẮP XẾP SẢN PHẨM
  let sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
    // console.log(sort);
  } else {
    sort.position = "asc";
  }
  // console.log(find);
  // console.log(sort);
  const products = await Product.find(find)
    .sort(sort)
    .limit(objectPagination.limitItem) //số phần tử cần lấy cho 1 trang
    .skip(objectPagination.skip); //Bỏ qua bnh sản phẩm để bắt đầu lấy limit

  for (const product of products) {
    //Lấy ra thông tin người tạo
    const userCreated = await Account.findOne({
      _id: product.createdBy.account_id,
    });
    if (userCreated) {
      product.accountFullName = userCreated.fullName;
    }
    //Lấy ra thông tin người cập nhật cuối cùng(1 mảng nhiều ng cập nhật)
    const updatedBy = product.updatedBy.slice(-1)[0];
    if (updatedBy) {
      const userUpdated = await Account.findOne({
        _id: updatedBy.account_id,
      });
      updatedBy.accountFullName = userUpdated.fullName;
    }
  }

  res.render("admin/pages/products/index", {
    title: "Danh sách sản phẩm",
    products: products,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
  });
};

// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;
  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };
  if(permissions.includes("products_edit")){

    await Product.updateOne(
      { _id: id },
      {
        status: status,
        $push: { updatedBy: updatedBy },
      }
    );
    req.flash("success", "Cập nhật trạng thái thành công!");
    res.redirect("back");
  }else{
    res.send("403");
    return;
  }
};
// [PATCH] /admin/products/change-multi/
// giữa trên form body để dùng req.body
module.exports.changeMulti = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(",");
  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };
  const permissions = res.locals.role.permissions;

  switch (type) {
    case "active":
      if(permissions.includes("products_edit")){

        await Product.updateMany(
          { _id: { $in: ids } },
          { status: "active", $push: { updatedBy: updatedBy } }
        );
        req.flash(
          "success",
          `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`
        );
        break;
      }else{
        res.send("403");
        return;
      }
    case "inactive":
      if(permissions.includes("products_edit")){

        await Product.updateMany(
          { _id: { $in: ids } },
          { status: "inactive", $push: { updatedBy: updatedBy } }
        );
        req.flash(
          "success",
          `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`
        );
        break;
      }else{
        res.send("403");
        return;
      }
    case "delete-all": //xóa mềm
    if(permissions.includes("products_delete")){

      await Product.updateMany(
        { _id: { $in: ids } },
        {
          deleted: true,
          deletedBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date(),
          },
        }
      );
      req.flash("success", `Xóa thành công ${ids.length} sản phẩm!`);
      break;
    }else{
      res.send("403");
      return;
    }
    case "change-position": //Thay đổi vị trí
    if(permissions.includes("products_edit")){

      for (const item of ids) {
        // phần tử gồm 1 chuỗi id-position
        let [id, position] = item.split("-");
        position = parseInt(position);
        /// cập nhật vị trí của từng id
        await Product.updateOne(
          { _id: id },
          {
            position: position,
            $push: { updatedBy: updatedBy },
          }
        );
      }
      req.flash(
        "success",
        `Cập nhật vị trí thành công ${ids.length} sản phẩm!`
      );
      break;
    }else{
      res.send("403");
      return;
    }
  }
  res.redirect("back");
};

//[DELETE] /admin/products/delete/:id
module.exports.deleteOneItem = async (req, res) => {
  const permissions = res.locals.role.permissions;
  if(permissions.includes("products_delete")){
    const id = req.params.id;
  //Xóa mềm là chỉ update trường delete bằng true
  // cập nhật thêm thời gian xóa là thời gian user bấm nút delete(thời gian hiện tại)

  await Product.updateOne(
    { _id: id },
    {
      deleted: true,
      deletedBy: {
        account_id: res.locals.user.id,
        deletedAt: new Date(),
      },
    }
  );

  req.flash("success", `Xóa sản phẩm thành công!`);
  res.redirect("back");
  }else{
    res.send("403");
    return;
  }
  
};

// [GET] /admin/products/create
module.exports.createPage = async (req, res) => {
  let find = {
    deleted: false,
  };

  const records = await ProductCategory.find(find);
  const newRecords = createTreeCategory.createTree(records);
  res.render("admin/pages/products/create", {
    title: "Thêm mới sản phẩm",
    records: newRecords,
  });
};
// [POST] /admin/products/create
module.exports.createItem = async (req, res) => {
  const permissions = res.locals.role.permissions;
  if(permissions.includes("products_create")){
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
  
    if (req.body.position == "") {
      const countProducts = await Product.countDocuments();
      req.body.position = countProducts + 1;
    } else {
      req.body.position = parseInt(res.body.position);
    }
    // console.log(req.body);
    //Tạo mới và lưu 1 sản phẩm vào db
    req.body.createdBy = {
      //res.locals.user.id dùng cả view lẫn controller
      account_id: res.locals.user.id,
    };
    const product = new Product(req.body);
    await product.save();
  
    // Điều hướng về url về trang danh sách sản phẩm
    req.flash("success", `Tạo mới sản phẩm thành công!`);
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }else{
    res.send("403");
    return;
  }

 
};

// [GET] /admin/products/edit:id
module.exports.edit = async (req, res) => {
  try {
    let find = {
      deleted: false,
      _id: req.params.id,
    };
    const records = await ProductCategory.find({
      deleted: false,
    });
    const newRecords = createTreeCategory.createTree(records);
    const product = await Product.findOne(find);
    res.render("admin/pages/products/edit", {
      title: "Chỉnh sửa sản phẩm",
      product: product,
      records: newRecords,
    });
  } catch (error) {
    req.flash("error", `Sản phẩm không tồn tại!`);
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};

// [PATCH] /admin/products/edit:id
module.exports.editPatch = async (req, res) => {
  const permissions = res.locals.role.permissions;
  if(permissions.includes("products_edit")){
    const id = req.params.id;
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    // console.log(req.body);
    try {
      const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date(),
      };
      await Product.updateOne(
        {
          _id: id,
        },
        {
          ...req.body,
          $push: { updatedBy: updatedBy },
        }
      );
      req.flash("success", `Cập nhật sản phẩm thành công!`);
    } catch (error) {
      req.flash("error", `Cập nhật thất bại!`);
    }
    // Điều hướng về url về trang danh sách sản phẩm
    res.redirect(`back`);
  }else{
    res.send("403");
    return;
  }
 
};

// [GET] /admin/products/detail:id
module.exports.detail = async (req, res) => {
  try {
    let find = {
      deleted: false,
      _id: req.params.id,
    };
    const product = await Product.findOne(find);
    const category = await ProductCategory.findOne({
      _id: product.product_category_id,
    });
    res.render("admin/pages/products/detail", {
      title: product.title,
      product: product,
      category: category,
    });
  } catch (error) {
    req.flash("error", `Sản phẩm không tồn tại!`);
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};
