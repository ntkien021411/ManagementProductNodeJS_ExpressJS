const ProductCategory = require("../../models/product-category.model");
const systemConfig = require("../../config/system");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const filterStatusHelper = require("../../helpers/filterStatus");
const createTreeCategory = require("../../helpers/createTreeCategory");
// [GET] /admin/products-category/
module.exports.index = async (req, res) => {
  // BUTTON STATUS
  let filterStatus = filterStatusHelper(req.query);

  //  DEFAULT VARIABLE SEARCH DATABASE
  let find = {
    deleted: false,
  };

  // LỌC STATUS
  if (req.query.status) {
    find.status = req.query.status;
  }
  //TÌM KIẾM DANH MỤC SẢN PHẨM THEO TITLE
  let objectSearch = searchHelper(req.query);
  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }
  // //Total Page :
  // let countProducts = await ProductCategory.countDocuments(find);
  // //PAGINATION OBJECT
  // let objectPagination = paginationHelper(
  //   req.query,
  //   {
  //     limitItem: 4,
  //     currentPage: 1,
  //   },
  //   countProducts
  // );

  //SẮP XẾP DANH MỤC SẢN PHẨM
  let sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
    // console.log(sort);
  } else {
    //DEFAULT ASC BY POSITION
    sort.position = "asc";
  }
  //trả về 1 mảng các object item cha với thêm 1 thuộc tính là
  // mảng các item con
  
  // console.log(find);
  // console.log(sort);
  const record = await ProductCategory.find(find)
    .sort(sort)
    // .limit(objectPagination.limitItem) //số phần tử cần lấy cho 1 trang
    // .skip(objectPagination.skip);
  const newRecords = createTreeCategory.createTree(record);
  res.render("admin/pages/products-category/index", {
    title: "Danh mục sản phẩm",
    records: newRecords,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    // pagination: objectPagination,
  });
};
// [GET] /admin/products-category/create
module.exports.createPageProductCategory = async (req, res) => {
  let find = {
    deleted: false,
  };

  const records = await ProductCategory.find(find);
  const newRecords = createTreeCategory.createTree(records);
  // console.log(newRecords);

  res.render("admin/pages/products-category/create", {
    title: "Tạo danh mục sản phẩm",
    records: newRecords,
  });
};
// [POST] /admin/products-category/create
module.exports.createProductCategory = async (req, res) => {
  // console.log(req.body);
  if (req.body.position == "") {
    const countProducts = await ProductCategory.countDocuments();
    req.body.position = countProducts + 1;
  } else {
    req.body.position = parseInt(res.body.position);
  }
  // console.log(req.body);
  const record = new ProductCategory(req.body);
  await record.save();

  // Điều hướng về url về trang danh sách sản phẩm
  req.flash("success", `Tạo mới danh mục sản phẩm thành công!`);
  res.redirect(`${systemConfig.prefixAdmin}/products-category`);
};

// [PATCH] /admin/products-category/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;

  await ProductCategory.updateOne({ _id: id }, { status: status });
  req.flash("success", "Cập nhật trạng thái danh mục sản phẩm thành công!");
  res.redirect("back");
};

// [PATCH] /admin/products-category/change-multi/
// giữa trên form body để dùng req.body
module.exports.changeMulti = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(",");

  switch (type) {
    case "active":
      await ProductCategory.updateMany(
        { _id: { $in: ids } },
        { status: "active" }
      );
      req.flash(
        "success",
        `Cập nhật trạng thái thành công ${ids.length} danh mục sản phẩm!`
      );
      break;
    case "inactive":
      await ProductCategory.updateMany(
        { _id: { $in: ids } },
        { status: "inactive" }
      );
      req.flash(
        "success",
        `Cập nhật trạng thái  thành công ${ids.length} danh mục sản phẩm!`
      );
      break;
    case "delete-all": //xóa mềm
      await ProductCategory.updateMany(
        { _id: { $in: ids } },
        { deleted: true, deletedAt: new Date() }
      );
      req.flash("success", `Xóa thành công ${ids.length} danh mục sản phẩm!`);
      break;
    case "change-position": //Thay đổi vị trí
      for (const item of ids) {
        // phần tử gồm 1 chuỗi id-position
        let [id, position] = item.split("-");
        position = parseInt(position);
        /// cập nhật vị trí của từng id
        await ProductCategory.updateOne(
          { _id: id },
          {
            position: position,
          }
        );
      }
      req.flash(
        "success",
        `Cập nhật vị trí danh mục sản phẩm thành công ${ids.length} sản phẩm!`
      );
      break;
  }
  res.redirect("back");
};

//[DELETE] /admin/products-category/delete/:id
module.exports.deleteOnItem = async (req, res) => {
  const id = req.params.id;
  //Xóa mềm là chỉ update trường delete bằng true
  // cập nhật thêm thời gian xóa là thời gian user bấm nút delete(thời gian hiện tại)
  await ProductCategory.updateOne(
    { _id: id },
    { deleted: true, deletedAt: new Date() }
  );
  req.flash("success", `Xóa danh mục sản phẩm thành công!`);
  res.redirect("back");
};

// [GET] /admin/products-category/edit:id
module.exports.edit = async (req, res) => {
  try {
    let find = {
      deleted: false,
      _id: req.params.id,
    };
    let findAll = {
      deleted: false,
    };
  
    const records = await ProductCategory.find(findAll);
    const newRecords = createTreeCategory.createTree(records);

    const productCategory = await ProductCategory.findOne(find);
    res.render("admin/pages/products-category/edit", {
      title: "Chỉnh sửa danh mục sản phẩm",
      productCategory: productCategory,
      records : newRecords
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
  }
};

// [PATCH] /admin/products-category/edit:id
module.exports.editPatch = async (req, res) => {
  const id = req.params.id;
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);
  try {
    await ProductCategory.updateOne(
      {
        _id: id,
      },
      req.body
    );
    req.flash("success", `Cập nhật danh mục sản phẩm thành công!`);
  } catch (error) {
    req.flash("error", `Cập nhật danh mục thất bại!`);
  }
  // Điều hướng về url về trang danh sách sản phẩm
  res.redirect(`back`);
};

// [GET] /admin/products-category/detail:id
module.exports.detail = async (req, res) => {
  try {
    let find = {
      deleted: false,
      _id: req.params.id,
    };

    const productCategory = await ProductCategory.findOne(find);
    
    res.render("admin/pages/products-category/detail", {
      title: productCategory.title,
      productCategory: productCategory,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
  }
};
