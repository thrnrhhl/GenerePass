const IndexedDB = (props) => {
  try {
    let db;
    const setting = props.settings;
    const type = props.type;
    const callback = props.callback;
    let element = props.item;
    const openRequest = indexedDB.open(setting.idb, setting.version);

    
    openRequest.onupgradeneeded = (e) => {
      let thisdb = e.target.result;
      if (!thisdb.objectStoreNames.contains(setting.store)) {
        thisdb.createObjectStore(setting.store, { keyPath: setting.keypath });
        if(callback.upgradeneeded !== undefined) {
          callback.upgradeneeded(!thisdb.objectStoreNames.contains(setting.store));
        }
      }
    };
    openRequest.onsuccess = (e) => {
      db = e.target.result;
      let object = {
        readwrite: () => readwrite(db),
        readAll: () => read(db),
        deleteNote: () => deleteNote(db),
      };
      object[type]();
    };

    const readwrite = (props) => {
      let transaction = props.transaction(setting.store, "readwrite");
      let objectStore = transaction.objectStore(setting.store);
      let request;
      element.map((key, index) => {
        console.log(key);
        request = objectStore.add(key);
      });
      request.onerror = (e) => callback.success(e.target.readyState);
      request.onsuccess = (e) => callback.success(e.target.readyState);
    };
    const read = (props) => {
      let transaction = props.transaction(setting.store, "readonly");
      let objectStore = transaction.objectStore(setting.store);

      let request = objectStore.openCursor();
      let notes = new Array(0);

      request.onsuccess = (event) => {
        let cursor = event.target.result;
        if(callback.readArray !== undefined) {
          cursor != null
            ? (notes.push(cursor.value), cursor.continue())
            : callback.readArray(notes);
        } else {
          throw new Error("There is no callback.readArray function for returning data");
        }
        
          
      };
      request.onerror = (event) =>
        console.log("error in cursor request " + event.target.errorCode);
    };

    const deleteNote = (props) => {
      let transaction = props.transaction(setting.store, "readwrite");
      let objectStore = transaction.objectStore(setting.store).delete(element);
      console.log(1);
      transaction.onsuccess = (e) => {
        console.log(e.target);
      };
    };
  } catch (e) {
    console.error(e);
  }
};
