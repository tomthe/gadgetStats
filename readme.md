



## achtung

### copy database optional...deprecated! (wäre aber mal interessant, um die datenbank nicht jedesmal kopieren zu müsen!)
damit das läuft, folgenden code in ... hinzufügen:

One can also just edit the java souce code to fit their needs. In src/android/io/sqlc/SQLitePlugin.java ca. on line 203 there's this code:
also plugins/corvdova-sqlite-storage/src.....
von der seite: https://www.bountysource.com/issues/22433637-setting-path-of-db

```
    /**
     * Open a database from external directory. von tomthe
     * Author: Tom
     * @param dbName   The name of the database file
     */
    private SQLiteAndroidDatabase openDatabaseExternal(String dbname, CallbackContext cbc, boolean old_impl) throws Exception {
        try {
            // ASSUMPTION: no db (connection/handle) is already stored in the map
            // [should be true according to the code in DBRunner.run()]

            File dbfile = this.cordova.getActivity().getDatabasePath(dbname);
            File dbfile = new File(Environment.getExternalStorageDirectory().getAbsolutePath(), dbname);

            if (!dbfile.exists()) {
                dbfile.getParentFile().mkdirs();
            }

            Log.v("info", "Open sqlite db: " + dbfile.getAbsolutePath());

            SQLiteAndroidDatabase mydb = old_impl ? new SQLiteAndroidDatabase() : new SQLiteConnectorDatabase();
            mydb.open(dbfile);

            if (cbc != null) // XXX Android locking/closing BUG workaround
                cbc.success();

            return mydb;
        } catch (Exception e) {
            if (cbc != null) // XXX Android locking/closing BUG workaround
                cbc.error("can't open database " + e);
            throw e;
        }
    }
```
und am anfang:

import android.os.Environment