# Json2MySQL
The task is to take a JSON file and dynamically pass all its documents into a MySQL database table.


## Getting Started
These instructions will get you a copy of the project on your local machine to run or test. 
```
git clone https://github.com/iMelki/Json2MySQL.git
```


### Prerequisites
Node.js


### Installing
Download & Install [Node.js](https://nodejs.org/en/)
Go to the directory of the app
Enter the command:
```
npm install
```



## Running the app
Before the first run, create a dedicated MySQL account with only the permissions
needed for the destination database. Do not use the MySQL `root` account and do
not commit a password to `config.json`.

Provide credentials through environment variables:

```powershell
$env:MYSQL_HOST = 'localhost'
$env:MYSQL_USER = 'json2mysql'
$env:MYSQL_PASSWORD = '<set-locally>'
```

The password value above is a placeholder. Replace it only in your local shell.
The optional variables `MYSQL_DATABASE`, `MYSQL_TABLE`, and
`JSON2MYSQL_INPUT_PATH` override their non-secret defaults in `config.json`.

If a local file is more convenient, copy `config.json` to `config.local.json`
and put machine-specific settings there. `config.local.json` is ignored by Git.
Environment variables take precedence over both configuration files.

Choose a database table that fits the schema, or choose a non-existing one to
be created.
  
Now, this command will run the app on your local machine:

```
node index.js [%file_path% [%DB_name% [%table_name%]]]
```
  
Note: to see app's progress with debug comments in the console:
```
SET DEBUG=* & node index.js [%file_path% [%DB_name% [%table_name%]]]
``` 
  
Where %filePath% should be replaced with the input JSON file path,  
%DB_name% should be replaced with the database name  
and %table_name% should be replaced with the table name.  
They're not mandatory. If not specified, they'll be taken from the configuration file instead.  

The database integration tests require `MYSQL_TEST_USER` and
`MYSQL_TEST_PASSWORD`. They are skipped when those variables are absent rather
than falling back to a privileged default account.



## Author
* **iMelki** 


## License
This project is licensed under the GNU GPL v3.0 License - see the [LICENSE.md](LICENSE.md) file for details

