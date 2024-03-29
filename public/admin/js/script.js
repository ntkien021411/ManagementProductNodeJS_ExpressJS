// Button Status Product (Lọc sản phẩm)
const buttons = document.querySelectorAll("[button-status]");
if (buttons.length > 0) {
  // Lấy ra url ở trang web hiện tại
  let url = new URL(window.location.href);

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const status = button.getAttribute("button-status");
      if (status) {
        //Thêm 1  params lên trên thanh url
        url.searchParams.set("status", status);
      } else {
        //Xóa 1 params trên thanh url
        url.searchParams.delete("status");
      }
      window.location.href = url.href;
    });
  });
}
// Form search (Tìm kiếm sản phẩm)
const formSearch = document.querySelector("#form-search");
if (formSearch) {
  let url = new URL(window.location.href);

  formSearch.addEventListener("submit", (e) => {
    e.preventDefault();
    // console.log(e.target.elements.keyword.value);
    const keyword = e.target.elements.keyword.value;
    if (keyword) {
      url.searchParams.set("keyword", keyword);
    } else {
      url.searchParams.delete("keyword");
    }
    window.location.href = url.href;
  });
}
//Phân trang sản phẩm
const buttonPagination = document.querySelectorAll("[button-pagination]");
if (buttonPagination.length > 0) {
  // Lấy ra url ở trang web hiện tại
  let url = new URL(window.location.href);
  buttonPagination.forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.getAttribute("button-pagination");
      if (page) {
        //Thêm 1  params lên trên thanh url
        url.searchParams.set("page", page);
      } else {
        //Xóa 1 params trên thanh url
        url.searchParams.delete("page");
      }
      window.location.href = url.href;
    });
  });
}
//Xóa 1 sản phẩm
const buttonsDelete = document.querySelectorAll("[button-delete]");
if (buttonsDelete.length > 0) {

  const formDeleteItem = document.querySelector("#form-delete-item");
  const path = formDeleteItem.getAttribute("data-path");

  buttonsDelete.forEach((button) => {
    button.addEventListener("click", () => {

      const isConfirm = confirm("Bạn có chắc muốn xóa sản phẩm này?");

      if (isConfirm) {

        const id = button.getAttribute("data-id");

        const action = `${path}/${id}?_method=DELETE`;

        formDeleteItem.action = action;
        formDeleteItem.submit();
      
      }
    });
  });
}
// Sort -SẮP XẾP
const sort = document.querySelector("[sort]");
if(sort){
  const sortSelect = document.querySelector("[sort-select]");
  const sortClear = document.querySelector("[sort-clear]");
  // Lấy ra url ở trang web hiện tại
  let url = new URL(window.location.href);

  //Sắp xếp
  sortSelect.addEventListener("change", (e)=>{
    const value = e.target.value;
    const[sortKey,sortValue] = value.split("-");

    url.searchParams.set("sortKey", sortKey);
    url.searchParams.set("sortValue", sortValue);
    // console.log(sortKey,sortValue);
    window.location.href = url.href;
  })

  //Xóa sắp xếp
  sortClear.addEventListener("click", (e)=>{

    url.searchParams.delete("sortKey");
    url.searchParams.delete("sortValue");
    // console.log(sortKey,sortValue);
    window.location.href = url.href;
  })
  //Thêm selected cho option
  const sortKey =  url.searchParams.get("sortKey");
  const sortValue =  url.searchParams.get("sortValue");
  if(sortKey && sortValue){
    const stringSort = `${sortKey}-${sortValue}`;
     const optionSort = sortSelect.querySelector(`option[value='${stringSort}']`);
     optionSort.setAttribute("selected",true);
  }
}