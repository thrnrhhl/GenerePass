function App() {
  const [value, setValue] = React.useState("");
  const [filter, setFilter] = React.useState([false, false, false]);
  const [generePass, setGenerePass] = React.useState([]);
  const messages = [
    "The password has been copied to the clipboard",
    "Password saved successfully",
    "The maximum password length is 1000",
    "Select filters",
  ];
  const [message, setMessage] = React.useState(messages[0]);
  const [mesStatus, setMesStatus] = React.useState(0)
  const [prePass, setPrePass] = React.useState();
  const [preName, setPreName] = React.useState();
  const [data, setData] = React.useState([]);
  const messageRef = React.createRef();
  const saveRef = React.createRef();
  const modal = React.createRef();
  const keyNumber = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
  const symbols = {
    0: "0123456789",
    1: "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz",
    2: "§±!@#$%^&*()_+[]{};:''|/?><,.",
  };
  const SETTINGS = {
    idb: "GenerePass",
    version: 1,
    store: "g3n",
    keypath: "name",
  };

  document.addEventListener("keydown", (event) => {
    const even = (bool) => {
      return bool === true;
    };
    if (event.keyCode === 13) {
      if (filter.some(even) && value !== "") {
          console.log(value.length);
        generate();
      } else {
        setMessage(messages[3]);
        setMesStatus(1);
        setTimeout(() => setMesStatus(0), 1000);
      }
    } else if (event.keyCode === 8) {
      setValue(value.slice(0, -1));
    } else if (keyNumber.indexOf(event.keyCode) !== -1) {
      setValue(value + event.key.toString());
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target === modal.current) {
      modal.current.close();
    }
  });

  const handleClickFilter = (id) => {
    let array = filter;
    filter[id - 1] = !filter[id - 1];
    setFilter([...array]);
  };
  const handlyCopy = (text) => {
    navigator.clipboard.writeText(text);
    setMessage(messages[0]);
    setMesStatus(1);
    setTimeout(() => setMesStatus(0), 1000);
  };
  const handlePrePass = (pass) => {
    setPrePass(pass);
    setMessage(messages[1]);
    saveRef.current.style.display = "block";
  };

  const handleSave = (type) => {
    if (type === "save") {
      saveRef.current.style.display = "none";
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
      saveRef.current.style.display = "none";
    }
  };
  const handleShowModal = () => {
    IndexedDB({
      settings: SETTINGS,
      type: "readAll",
      callback: {
        readArray: (e) => setData(e),
      },
    });
    modal.current.showModal();
  };

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

  const generePassDiv = generePass.map((key, index) => {
    return (
      <>
        <div className={"app-password__item"} key={index}>
          <div
            className={"app-password__item-pass"}
            key={index}
            onClick={handlyCopy.bind(this, key)}
          >
            {key}
          </div>
          <div
            className={"app-password__item-star"}
            onClick={handlePrePass.bind(this, key)}
          ></div>
        </div>
      </>
    );
  });

  const divData = data.map((key, index) => {
    return (
      <div className={"pass-list__item"} key={index}>
        <div className={"pass-list__item-name"}>
          <span className={"pass-list__item-name__text"}>Name:</span>
          <span className={"pass-list__item-name__sname"}>{key.name}</span>
        </div>
        <div className={"pass-list__item-pass"}>
          <span className={"pass-list__item-pass__text"}>Pass:</span>
          <button
            className={"pass-list__item-pass__button"}
            onClick={handlyCopy.bind(this, key.password)}
          >
            Copy
          </button>
        </div>
      </div>
    );
  });

  return (
    <>
      <button className={"saving-button"} onClick={() => handleShowModal()}>
        Saved passwords
      </button>
      <button className={"saving-button"} onClick={() => handleDownload()}>
        Download passwords
      </button>

      <dialog ref={modal} className={"modal"}>
        <div className={"modal-header"}></div>
        <div className={"modal-body"}>
          <div className={"pass-list"}>
            {divData.length === 0 ? (
              <h1 className={"pass-list__null"}>Your <span>saved passwords</span> will be shown here</h1>
            ) : (
              divData
            )}
          </div>
        </div>
      </dialog>
      <div
        className={"app-message"}
        ref={messageRef}
        style={mesStatus === 0 ? { display: "none" } : { display: "block" }}
      >
        {message}
      </div>
      <div
        className={"app-save-form"}
        ref={saveRef}
        style={{ display: "none" }}
      >
        <input
          type="text"
          placeholder="Name"
          onChange={(e) => setPreName(e.target.value)}
        />
        <button onClick={handleSave.bind(this, "save")}>Save</button>
        <button onClick={handleSave.bind(this, "cancel")}>Cancel</button>
      </div>
      <div className={"app"}>
        <div className={"app-saving-password"}></div>
        <div className={"app-header"}>
          <img src="logo.svg" width="130" />
        </div>
        <div className={"app-main"}>
          <div className={"app-main__row"}>
            <div
              className={
                filter[0] === true
                  ? "app-main__row-button active"
                  : "app-main__row-button"
              }
              onClick={() => handleClickFilter(1)}
            >
              <span className={"app-main__row-button__text"}>Numbers</span>
            </div>
            <div
              className={
                filter[1] === true
                  ? "app-main__row-button active"
                  : "app-main__row-button"
              }
              onClick={() => handleClickFilter(2)}
            >
              <span className={"app-main__row-button__text"}>Letters</span>
            </div>
          </div>
          <div className={"app-main__row2"}>
            <div
              className={
                filter[2] === true
                  ? "app-main__row-button active"
                  : "app-main__row-button"
              }
              onClick={() => handleClickFilter(3)}
            >
              <span className={"app-main__row-button__text"}>Symbols</span>
            </div>
          </div>
        </div>
        <div className={"app-password"}>
          {generePassDiv}
          {generePassDiv.length === 0 ? (
            <div className={"app-password__text"}>
              <span className={"app-password__text-char"}>§ </span>
              Hi, this is a password generator. In order to enter the password
              length, just press the "Numbers" keys and when you enter the
              optimal length, press "Enter" and the password will be generated
              by itself.
              <br />
              <br />
              To copy the password, click on the block with the password that
              suits you the most, and if you want to save the password, but
              click on the asterisk (this is to the left of the password) and a
              block with the input will appear on top of the window, you need to
              enter the name for the password there so that in the future you do
              not forget what this password was from
              <div className={"app-password__text-test"}>
                Test input numbers: <span>{value}</span>
              </div>
            </div>
          ) : (
            <div className={"app-password-input"}>{value}</div>
          )}
        </div>
      </div>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
