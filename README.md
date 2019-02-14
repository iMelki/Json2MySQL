# Json2MySQL
The task is to take a JSON file and dynamically pass all its documents into a MySQL database table ('accountsDB.accounts').


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
Go to the directory of the app.
Now, this command will run the app on your local machine.

```
node Json2MySQL.js %fileAdd%
```
Where %fileAdd% should be replaced with the input JSON file path.



Note: to see app's progress with debug comments in the console:
```
SET DEBUG=Main,DB & node Json2MySQL.js %fileAdd%
``` 



## Author
* **Ilan Melki** 


## License
This project is licensed under the GNU GPL v3.0 License - see the [LICENSE.md](LICENSE.md) file for details

