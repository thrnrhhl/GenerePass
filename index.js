function App() {
  // Hooks for input value
  const [value, setValue] = React.useState("");
  // Hooks for checking filter
  const [filter, setFilter] = React.useState([false, false, false]);
  // Hooks for output generation password
  const [generePass, setGenerePass] = React.useState([]);
  // Array for description on index page
  const description = [
    "Привет, это генератор паролей - GenerePass. Здесь вы можете не только создать пароль, но и сохранить и скачать. Пароли хранятся в вашей локальной памяти браузера, доступ к нему имеете только вы.",
    'После генерации пароля, чтобы скопировать его, нажмите на блок с паролем, который вам больше всего подходит, и если вы хотите сохранить пароль, то нажмите на звездочку (это справа от пароля) и в центре экрана появится блок с вводом, вам нужно ввести туда имя для пароля, чтобы в будущем вы не забыли, от чего этот пароль был',
  ];
  // Array for message in moment do
  const messages = [
    "Пароль скопирован в буфер обмена",
    "Пароль успешно сохранен",
    "Максимальная длина пароля 1000",
    "Выберите фильтры",
  ];
  // Checking window "px" for style
  const innerWidth =
    window.innerWidth < 500 ? ["100%", "190%"] : ["100%", "1000%"];
  // Hooks for message
  const [message, setMessage] = React.useState(messages[0]);
  // Hooks for message status output or not
  const [mesStatus, setMesStatus] = React.useState(0);
  // A hook to check which form to output
  const [form, setForm] = React.useState("copy");
  // Hook for state pass at the time of selection
  const [prePass, setPrePass] = React.useState();
  // Hook for state name when user input "Name"
  const [preName, setPreName] = React.useState();
  // Hook for output password from IndexedDB
  const [data, setData] = React.useState([]);
  // Ref fro modal block
  const modal = React.createRef();
  // Object for symbols
  const symbols = {
    0: "0123456789",
    1: "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz",
    2: "§±!@#$%^&*()_+[]{};:''|/?><,.",
  };
  // Settings for IndexedDB
  const SETTINGS = {
    idb: "GenerePass",
    version: 1,
    store: "g3n",
    keypath: "name",
  };
  // Function for check empty filters or not
  const createPassword = () => {
    const even = (bool) => {
      return bool === true;
    };
    if (filter.some(even) === true && value !== "") {
      console.log(value);
      generate();
    } else {
      setMessage(messages[3]);
      setMesStatus(1);
      setTimeout(() => setMesStatus(0), 1000);
      setValue("");
    }
  };
  // When you click outside the modal window, it is hidden
  document.addEventListener("click", (event) => {
    if (event.target === modal.current) {
      modal.current.setAttribute(
        "style",
        `height: ${innerWidth[1]}; z-index: 0`
      );
    }
  });
  // function for click or cancel filter
  const handleClickFilter = (id) => {
    let array = filter;
    filter[id - 1] = !filter[id - 1];
    setFilter([...array]);
  };
  // Function for copy selection password
  const handlyCopy = (text) => {
    navigator.clipboard.writeText(text);
    modal.current.setAttribute("style", `height: ${innerWidth[1]}; z-index: 0`);
    setMessage(messages[0]);
    setMesStatus(1);
    setTimeout(() => setMesStatus(0), 1000);
  };
  // When you click on the asterisk, a modal window appears to save the password
  const handlePrePass = (pass) => {
    setPrePass(pass);
    setMessage(messages[1]);
    setForm("save");
    modal.current.setAttribute("style", `height: ${innerWidth[0]}; z-index: 3`);
  };
  // A function for saving a password from being entered into the database
  const handleSave = (type) => {
    if (type === "save") {
      modal.current.setAttribute(
        "style",
        `height: ${innerWidth[1]}; z-index: 0`
      );
      IndexedDB({
        settings: SETTINGS,
        type: "readwrite",
        item: [{ name: preName, password: prePass }],
        callback: {
          success: (e) => {
            if (e === "done") {
              setMessage(messages[1]);
              setMesStatus(1);
              setTimeout(() => setMesStatus(0), 1000);
            }
          },
        },
      });
    } else {
      modal.current.setAttribute(
        "style",
        `height: ${innerWidth[1]}; z-index: 0`
      );
    }
  };
  // Function for opening a modal window and displaying saved passwords
  const handleShowModal = () => {
    IndexedDB({
      settings: SETTINGS,
      type: "readAll",
      callback: {
        readArray: (e) => setData(e),
      },
    });
    setForm("copy");
    modal.current.setAttribute("style", `height: ${innerWidth[0]}; z-index: 3`);
  };
  // Function for saving previously saved passwords
  const handleDownload = () => {
    IndexedDB({
      settings: SETTINGS,
      type: "readAll",
      callback: {
        readArray: (e) => {
          let str = "";
          e.map((key) => {
            str += `Name: ${key.name} \nPassword: ${key.password}\n------------- \n`;
          });
          let blob = new Blob([str], { type: "text/plain" });
          let link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "GenerePass_" + Date.now() + ".txt";
          link.click();
        },
      },
    });
  };
  // The main function for generating passwords
  const generate = () => {
    let symb = "";
    let str = "";
    let array = [];
    filter.map((key, index) =>
      key === true ? (symb += symbols[index]) : null
    );
    for (let i = 0; i < 5; i++) {
      str = "";
      for (let j = 0; j < Number(value); j++) {
        str += symb.charAt(Math.floor(Math.random() * symb.length));
      }
      array.push(str);
    }
    setGenerePass(array);
  };
  // Output of generated passwords
  const generePassDiv = generePass.map((key, index) => {
    return (
      <div className={"generation__item"} key={index}>
        <div
          className={"generation__item-pass"}
          onClick={handlyCopy.bind(this, key)}
        >
          {key}
        </div>
        <div className={"generation__item-span"}>
          <div onClick={handlePrePass.bind(this, key)}>*</div>
        </div>
      </div>
    );
  });
  // Output of saved passwords
  const divData = data.map((key, index) => {
    return (
      <div className={"list-save-password__item"} key={index}>
        <div class="list-save-password__item-block">
          <div className={"list-save-password__item-block__name"}>
            {key.name}
          </div>
          <div className={"list-save-password__item-block__button"}>
            <button onClick={handlyCopy.bind(this, key.password)}>
              Копировать
            </button>
          </div>
        </div>
      </div>
    );
  });
  // Application rendering
  return (
    <>
      {/* Модальное окно */}
      <div ref={modal} className={"modal"} style={{ height: innerWidth[1] }}>
        <div className={"modal-header"}></div>
        <div className={"modal-body"}>
          {form === "copy" ? (
            <CopyPass len={divData.length} data={divData} />
          ) : (
            <SavePass
              inputName={setPreName.bind(this)}
              button={handleSave.bind(this)}
            />
          )}
        </div>
      </div>

      {/* Блок для сообщения */}
      <div
        className={"message"}
        style={mesStatus === 0 ? { display: "none" } : { display: "block" }}
      >
        {message}
      </div>

      {/* Кнопки сохранения пароля и скачивания */}
      <div class="menu">
        <div class="menu__item">
          <img src="Folder-b.svg" onClick={() => handleShowModal()} />
        </div>
        <div class="menu__item">
          <img src="Cloud-b.svg" width="40" onClick={() => handleDownload()} />
        </div>
      </div>

      <div class="wrapper">
        <Header />
        <div class="filter">
          <div class="filter-block">
            <div class="filter-block-row">
              <div
                className={
                  filter[0] === true
                    ? "filter-block-row__item active"
                    : "filter-block-row__item"
                }
                onClick={() => handleClickFilter(1)}
              >
                <p class="filter-block-row__item-text number">Цифры</p>
              </div>
              <div
                className={
                  filter[1] === true
                    ? "filter-block-row__item active"
                    : "filter-block-row__item"
                }
                onClick={() => handleClickFilter(2)}
              >
                <p class="filter-block-row__item-text letter">Буквы</p>
              </div>
            </div>
            <div class="filter-block-row" style={{ marginBottom: "30px" }}>
              <div
                className={
                  filter[2] === true
                    ? "filter-block-row__item active"
                    : "filter-block-row__item"
                }
                onClick={() => handleClickFilter(3)}
              >
                <p class="filter-block-row__item-text symbols">Символы</p>
              </div>
            </div>
          </div>
          <div class="filter-input">
            <div class="filter-input__input">
              <input
                type="number"
                value={value}
                placeholder="100"
                onChange={(e) => setValue(e.target.value)}
              />
              <button onClick={createPassword.bind(this)}>Создать</button>
            </div>
          </div>
        </div>
        {generePassDiv.length !== 0 ? (
          <div class="generation">{generePassDiv}</div>
        ) : (
          <Description text={description} />
        )}
      </div>
    </>
  );
}

// Header Component
const Header = () => (
  <div className={"head"}>
    <img class="head-logo" src="logo.svg" />
  </div>
);
// Description Component
const Description = (props) => {
  return (
    <div class="description">
      <span>§</span>{props.text[0]}
      <br />
      <br />
      {props.text[1]}
    </div>
  );
};
// Saving password Component
const CopyPass = (props) => {
  return (
    <div className={"list-save-password"}>
      {props.len === 0 ? (
        <h1 className={"list-password__null"}>
          Ваши <span>сохраненные пароли</span>
          будут показаны здесь
        </h1>
      ) : (
        props.data
      )}
    </div>
  );
};
// Save Component
const SavePass = (props) => {
  return (
    <div className={"form-save"}>
      <div className={"form-save__text"}>Сохранение пароля</div>
      <div className={"form-save__input"}>
        <input
          type="text"
          placeholder="Введите наименование"
          onChange={(e) => props.inputName(e.target.value)}
        />
      </div>
      <div className={"form-save__button"}>
        <button onClick={props.button.bind(this, "save")}>Сохранить</button>
        <button onClick={props.button.bind(this, "cancel")}>Отменить</button>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
