function generateFakePerson() {

	function generateFakeFirstName() {
		var fnames = ["Adam","Alex","Abby","Andrew","Adonis","Alec","Anthony","Bobby","Bill","Beavis","Blaine","Blaire","Brian","Cam","Charlie","Charles","Corwin", "Dina","Dan","Derick","Demeter",
					  "Eric","Erin","Elric","Ead", "Frank","Fauna", "Flip", "Frenchie", "George", "Gill", "Gianna", "Gilbert", "Henry", "Hank", "Hillary", "Hop","Ignatious","Iggy","Jacob", "Jamie", "James", "Jennifer", "Jules", 
					  "Karen", "Kris", "Kevin", "Laura", "Leah", "Lane", "Lucas", "Lynn", "Mary", "Margaret", "Moses", "Nancy", "Noah", "Ophelia", "Olivia", "Paul", "Peter", "Raymond", "Randolp", "Rudy", "Sam", "Sarah", 
					  "Sally", "Sean", "Ted", "Theodore", "Tammy", "Tiffany", "Victor", "Vance", "Yorick", "Zelda"];
		return randomArrayElm(fnames);
	}

	function generateFakeLastName() {
		var lnames = ["Adams","Anderson","Boudreaux","Brown","Camden","Jackson","Johnson","Jones","Miller","Moneymaker","Moore","Sharp","Smith","Stroz","Taylor","Thomas","Williams","Wilson",
					  "White","Harris","Martin","Thompson","Garcia","Martinez","Robinson","Clark","Rodriguez","Lewis","Lee","Walker","Hall","Allen","Young","Hernandez","King","Wright",
					  "Lopez","Hill","Scott","Green","Baker","Gonzales","Nelson","Carter","Mitchell","Perez","Roberts","Turner"];
		return randomArrayElm(lnames);
	}

	function generateFakeDepartment() {
		return randomArrayElm(["Engineering","Marketing","Janitorial","Sales","Quality Assurance","Training","Evangelism","Product Management"]);	
	}

	var person = {};
	person.firstname = generateFakeFirstName();
	person.lastname = generateFakeLastName();
	person.department = generateFakeDepartment();

	person.email = person.firstname.charAt(0).toLowerCase() + person.lastname.toLowerCase() + "@fakecorp.com";
	return person;
}

function randomArrayElm(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}