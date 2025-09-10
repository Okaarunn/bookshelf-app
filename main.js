/**
 * [
 *    {
 *      id: <int>
 *      title: <string>
 *      author: <string>
 *      year: <int>
 *      isComplete: <boolean>
 *    }
 * ]
 *
 * isComplete Status: "Belum selesai dibaca” menjadi “Selesai dibaca”
 *
 */

// global variable
const books = [];
const STORAGE_KEY = "BOOK_APPS";
const RENDER_EVENT = "render-book";

// check if storage exist
const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
};

console.log(isStorageExist());

// save data to storage
const saveData = () => {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
};

// function load data from storage
const loadDataFromStorage = () => {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
};

// function generate unique book id
const generateUniqueId = () => {
  return +new Date();
};

// function generate book obj
const generateBookObj = (id, title, author, year, isComplete) => {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
};

// function create book item
const createBookItems = (bookObj) => {
  const { id, title, author, year, isComplete } = bookObj;

  // book identity
  const bookTitle = document.createElement("h3");
  bookTitle.innerText = title;
  bookTitle.classList.add("book-title");
  bookTitle.setAttribute("data-testid", "bookItemTitle");

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = `Penulis: ${author}`;
  bookAuthor.classList.add("book-author");
  bookAuthor.setAttribute("data-testid", "bookItemAuthor");

  const bookYear = document.createElement("p");
  bookYear.innerText = `Tahun: ${year}`;
  bookYear.classList.add("book-year");
  bookYear.setAttribute("data-testid", "bookItemYear");

  // button
  const buttonContainer = document.createElement("div");

  const completeButton = document.createElement("button");
  completeButton.innerText = isComplete
    ? "Belum selesai dibaca"
    : "Selesai Dibaca";
  completeButton.classList.add("btn-status");
  completeButton.setAttribute("data-testid", "bookItemIsCompleteButton");

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Hapus Buku";
  deleteButton.classList.add("btn-delete");
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");

  const editButton = document.createElement("button");
  editButton.innerText = "Edit Buku";
  editButton.classList.add("btn-edit");
  editButton.setAttribute("data-testid", "bookItemEditButton");

  // append child in button container
  buttonContainer.append(completeButton, deleteButton, editButton);

  // set attribute in container

  const container = document.createElement("div");
  container.classList.add("book-container");
  container.setAttribute("data-testid", "bookItem");
  container.setAttribute("data-bookid", id);

  // append child in book container
  container.append(bookTitle, bookAuthor, bookYear, buttonContainer);

  // event button logic
  completeButton.addEventListener("click", function () {
    toggleBookStatus(id);
  });

  deleteButton.addEventListener("click", function () {
    removeBook(id);
  });

  editButton.addEventListener("click", function () {
    editBook(id);
  });

  return container;
};

// function toggle book status
const toggleBookStatus = (bookId) => {
  const bookTarget = findBook(bookId);

  // complete => inComplete
  bookTarget.isComplete = !bookTarget.isComplete;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

// function find id book
const findBook = (bookId) => {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }

  return null;
};

// function find index book in array
const findBookIndex = (bookId) => {
  return books.findIndex((book) => book.id === bookId);
};

// function remove book
const removeBook = (bookId) => {
  // get book id
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  // delete book from array
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

// function edit book
const editBook = (bookId) => {
  const bookTarget = findBook(bookId);

  // passed value data book id to input form
  document.getElementById("bookFormTitle").value = bookTarget.title;
  document.getElementById("bookFormAuthor").value = bookTarget.author;
  document.getElementById("bookFormYear").value = bookTarget.year;
  document.getElementById("bookFormIsComplete").checked = bookTarget.isComplete;

  // remove books id to avoid duplicate book
  removeBook(bookId);
};

// function search book
const searchBook = (key) => {
  // filter book
  const filterBooks = books.filter((book) =>
    book.title.toLowerCase().includes(key.toLowerCase())
  );

  const completeBookList = document.getElementById("completeBookList");
  const incompleteBookList = document.getElementById("incompleteBookList");

  completeBookList.innerHTML = "";
  incompleteBookList.innerHTML = "";

  //   get book from filter book
  for (const book of filterBooks) {
    const bookItem = createBookItems(book);
    if (book.isComplete) {
      completeBookList.append(bookItem);
    } else {
      incompleteBookList.append(bookItem);
    }
  }
};

// function add new book
const addBook = () => {
  // get value from input
  const bookTitle = document.getElementById("bookFormTitle").value;
  const bookAuthor = document.getElementById("bookFormAuthor").value;
  const bookYear = document.getElementById("bookFormYear").value;
  const bookStatus = document.getElementById("bookFormIsComplete").checked;

  // generate unique id
  const generateID = generateUniqueId();

  const bookObj = generateBookObj(
    generateID,
    bookTitle,
    bookAuthor,
    bookYear,
    bookStatus
  );

  books.push(bookObj);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

// DOM loaded
document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("bookForm");
  const searchForm = document.getElementById("searchBook");

  // handle submit book
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
    submitForm.reset();
  });

  // handle search book
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    // get input key from user
    const key = document.getElementById("searchBookTitle").value;
    searchBook(key);
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// RENDER EVENT
document.addEventListener(RENDER_EVENT, function () {
  const completeBookList = document.getElementById("completeBookList");
  const incompleteBookList = document.getElementById("incompleteBookList");

  completeBookList.innerHTML = "";
  incompleteBookList.innerHTML = "";

  for (const book of books) {
    const bookItem = createBookItems(book);
    if (book.isComplete) {
      completeBookList.append(bookItem);
    } else {
      incompleteBookList.append(bookItem);
    }
  }
});
