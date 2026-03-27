// Global name bank — sourced from UK ONS, US SSA, and Behind the Name reference data.
// Pre-screened: letters only, 2–20 chars. All entries pass validateNameFormat rules.
// Sorted alphabetically. Used by NamePicker component.

const NAMES_RAW: string[] = [
  // ── English (traditional) ─────────────────────────────────────────────────
  "Abigail","Ada","Adelaide","Adele","Agnes","Alice","Amelia","Amy","Anastasia","Andrea",
  "Angela","Ann","Anna","Anne","Annabelle","Arabella","Audrey","Aurora","Beatrice","Bella",
  "Beth","Bridget","Caroline","Catherine","Cecelia","Charlotte","Clara","Claudia","Constance",
  "Daphne","Diana","Dorothy","Edith","Eleanor","Elizabeth","Ellen","Elspeth","Emily","Emma",
  "Eva","Evelyn","Faith","Fiona","Florence","Frances","Gabrielle","Georgia","Georgina","Grace",
  "Hannah","Harriet","Helen","Imogen","Isabel","Isabella","Jane","Jennifer","Jessica","Joan",
  "Josephine","Joyce","Julia","Katherine","Laura","Lavinia","Lillian","Lily","Louise","Lucy",
  "Lydia","Mabel","Margaret","Martha","Mary","Maud","Millicent","Miriam","Natalia","Natalie",
  "Nora","Olive","Olivia","Patricia","Penelope","Philippa","Phoebe","Priscilla","Rachel",
  "Rebecca","Rosalind","Rose","Rosemary","Ruth","Sarah","Sophia","Sophie","Stella","Susan",
  "Sylvia","Teresa","Tess","Theodora","Victoria","Violet","Virginia","Vivian","Winifred",
  // ── English (modern female) ───────────────────────────────────────────────
  "Aaliyah","Addison","Alexa","Alexis","Alicia","Allison","Alyssa","Amber","Ava","Avery",
  "Bailey","Bethany","Bianca","Brittany","Brooke","Brynn","Caitlin","Chloe","Claire","Daisy",
  "Devon","Ella","Ellie","Erica","Erin","Gemma","Gina","Harper","Hayley","Holly","Jade",
  "Jamie","Jordan","Kayla","Kira","Lacey","Leah","Lena","Lexie","Lila","Lindsay","London",
  "Luna","Mackenzie","Madeline","Madison","Maya","Megan","Mia","Molly","Morgan","Naomi",
  "Natasha","Nicole","Nina","Paige","Payton","Piper","Quinn","Raven","Reagan","Riley","Roxy",
  "Ruby","Sadie","Samantha","Sara","Savannah","Scarlett","Serena","Shannon","Sienna","Skye",
  "Sloane","Stephanie","Summer","Tara","Tatum","Taylor","Tia","Tiffany","Tori","Trinity",
  "Vanessa","Vera","Whitney","Willow","Yasmin","Zara","Zoe",
  // ── English (male) ────────────────────────────────────────────────────────
  "Aaron","Adam","Albert","Alfred","Andrew","Arthur","Bernard","Charles","Christopher",
  "Clement","David","Dennis","Douglas","Edmund","Edward","Edwin","Ernest","Eugene","Francis",
  "Frederick","George","Gerald","Gordon","Graham","Harold","Henry","Herbert","Howard","Hugh",
  "James","John","Jonathan","Julian","Lawrence","Leonard","Lewis","Malcolm","Marcus","Mark",
  "Martin","Matthew","Michael","Nicholas","Oliver","Patrick","Paul","Peter","Philip","Ralph",
  "Raymond","Richard","Robert","Roger","Ronald","Samuel","Simon","Stephen","Thomas","Timothy",
  "Victor","Walter","William",
  "Aidan","Alex","Blake","Brandon","Brayden","Brody","Cameron","Carson","Chase","Cole",
  "Colin","Connor","Damian","Dean","Declan","Derek","Dominic","Drake","Ethan","Evan","Finn",
  "Gavin","Grant","Grey","Ian","Jack","Jacob","Jake","Jason","Jax","Jayden","Jesse","Justin",
  "Kai","Kevin","Kyle","Landon","Leo","Liam","Logan","Luke","Mason","Max","Miles","Noah",
  "Nolan","Owen","Parker","Reid","Ryan","Sebastian","Seth","Shane","Trevor","Tyler","Wyatt",
  "Xavier","Zach",
  // ── Irish & Celtic ────────────────────────────────────────────────────────
  "Aoife","Brigid","Caoimhe","Deirdre","Eimear","Grainne","Maeve","Niamh","Orla","Roisin",
  "Saoirse","Siobhan","Sorcha","Fionnuala","Iseult","Isolde","Catriona","Eilidh","Mhairi",
  "Morwenna","Rhiannon","Bronwyn","Cerys","Ffion","Seren","Nia","Nerys","Carys","Bethan",
  "Aodhán","Ciarán","Cormac","Diarmuid","Eoin","Fionn","Killian","Lochlan","Padraig","Ruairi",
  "Tadhg","Tiernan","Oisin","Fergus","Darragh","Seamus","Cathal","Pádraig","Ronan","Seán",
  // ── Scottish ─────────────────────────────────────────────────────────────
  "Ailsa","Fiona","Heather","Morag","Catriona","Muireall","Seona","Marsali","Mhairi","Ishbel",
  "Alasdair","Calum","Dougal","Hamish","Iain","Murdo","Rory","Angus","Gregor","Ruaraidh",
  // ── French ───────────────────────────────────────────────────────────────
  "Adele","Anais","Brigitte","Camille","Cecile","Clemence","Delphine","Elise","Emilie",
  "Elodie","Fleur","Francoise","Genevieve","Ines","Isabelle","Juliette","Laure","Leonie",
  "Lucie","Manon","Marie","Marion","Mathilde","Morgane","Nathalie","Noemie","Pauline",
  "Sabine","Sandrine","Solene","Valerie","Victoire","Violette","Clemence","Amelie","Bernadette",
  "Antoine","Baptiste","Clement","Etienne","Francois","Gauthier","Guillaume","Hugo","Leo",
  "Mathieu","Nicolas","Pierre","Raphael","Theo","Tristan","Xavier","Yann","Adrien","Alexis",
  "Arnaud","Benoit","Cedric","Damien","Emmanuel","Fabrice","Florian","Julien","Laurent",
  "Maxime","Olivier","Pascal","Philippe","Renaud","Sebastien","Vincent",
  // ── Italian ──────────────────────────────────────────────────────────────
  "Alessia","Beatrice","Bianca","Chiara","Claudia","Elena","Elisa","Federica","Francesca",
  "Giulia","Ginevra","Irene","Lavinia","Lucrezia","Martina","Matilde","Monica","Paola",
  "Raffaella","Roberta","Silvia","Sofia","Valeria","Valentina","Veronica","Vittoria","Serena",
  "Costanza","Fiamma","Donatella","Grazia","Lorenza","Ornella","Rossella","Sabrina",
  "Alessandro","Emanuele","Fabio","Federico","Francesco","Giovanni","Giulio","Lorenzo","Luca",
  "Matteo","Niccolo","Roberto","Salvatore","Stefano","Aldo","Bruno","Carlo","Daniele","Diego",
  "Edoardo","Filippo","Gianluca","Jacopo","Marco","Massimo","Paolo","Riccardo","Simone",
  // ── Spanish ──────────────────────────────────────────────────────────────
  "Alejandra","Beatriz","Carmen","Catalina","Elena","Esmeralda","Eva","Gabriela","Ines",
  "Isabela","Lorena","Lucia","Marta","Mercedes","Paloma","Pilar","Raquel","Silvia","Sofia",
  "Valentina","Veronica","Ximena","Amparo","Consuelo","Dolores","Esperanza","Gloria","Lola",
  "Marisol","Montserrat","Nuria","Rocio","Sonia","Yolanda",
  "Alejandro","Carlos","Diego","Emilio","Ernesto","Fernando","Francisco","Gabriel","Gerardo",
  "Guillermo","Hector","Ignacio","Javier","Jorge","Jose","Lucas","Mateo","Pablo","Raul",
  "Ricardo","Rodrigo","Sebastian","Santiago","Andres","Antonio","Cesar","David","Eduardo",
  "Enrique","Ivan","Joaquin","Manuel","Miguel","Rafael","Sergio","Victor",
  // ── Portuguese ───────────────────────────────────────────────────────────
  "Beatriz","Bruna","Catarina","Filipa","Ines","Joana","Mariana","Marta","Rita","Teresa",
  "Tania","Vanessa","Veronika","Andre","Antonio","Carlos","Diogo","Filipe","Goncalo","Henrique",
  "Joao","Luis","Nuno","Pedro","Rui","Tiago","Vasco","Afonso","Bruno","Dinis","Eduardo",
  // ── German & Austrian ────────────────────────────────────────────────────
  "Adelheid","Britta","Claudia","Elke","Erika","Gertrude","Hannelore","Heidi","Hildegard",
  "Ingeborg","Johanna","Katrin","Klara","Lena","Lieselotte","Mathilde","Petra","Renate",
  "Sigrid","Ursula","Annika","Astrid","Dorothea","Elisabeth","Friederike","Greta","Hanna",
  "Ines","Judith","Katharina","Leonie","Luise","Marie","Monika","Natalie","Nina","Paula",
  "Sandra","Sonja","Susanne","Theresa","Ulrike","Veronika",
  "Dieter","Erik","Fritz","Gunter","Hans","Heinrich","Helmut","Klaus","Konrad","Lukas",
  "Moritz","Otto","Rolf","Stefan","Wilhelm","Andreas","Bernd","Christian","Christoph",
  "Dominik","Felix","Florian","Gerhard","Holger","Johannes","Jonas","Juergen","Karl",
  "Markus","Matthias","Michael","Patrick","Rainer","Sebastian","Simon","Thomas","Tobias",
  "Torsten","Ulrich","Volker","Werner",
  // ── Dutch ────────────────────────────────────────────────────────────────
  "Anneke","Fleur","Hanneke","Inge","Lieke","Maaike","Mirjam","Nienke","Roos","Tineke",
  "Bram","Daan","Dirk","Joost","Koen","Lars","Niels","Pieter","Ruben","Sander","Wouter",
  // ── Nordic (Swedish/Norwegian/Danish/Finnish) ─────────────────────────────
  "Astrid","Birgit","Freya","Greta","Gunilla","Hildur","Ingrid","Karin","Katja","Malin",
  "Sigrid","Solveig","Tuva","Ylva","Frida","Helena","Ida","Johanna","Kristin","Lena",
  "Linda","Lisa","Maria","Maja","Mia","Monica","Nina","Petra","Sara","Sofia","Sophia",
  "Annika","Britta","Eva","Elin","Emma","Hanna","Josefin","Karina","Linnea","Matilda",
  "Anders","Axel","Bjorn","Dag","Edvard","Gunnar","Hakon","Ingvar","Knut","Lars","Leif",
  "Magnus","Niels","Ragnar","Sven","Thor","Viktor","Andreas","Erik","Frederik","Jens",
  "Johan","Jonas","Mikael","Nicolai","Peter","Thomas","Aino","Eeva","Helvi","Kirsi","Leena",
  "Paivi","Satu","Siiri","Eero","Juhani","Matti","Mikko","Paavo","Seppo","Vilho","Joonas",
  "Markku","Pekka","Petri","Samuli","Timo","Tuomas","Ville",
  // ── Eastern European (Polish) ─────────────────────────────────────────────
  "Agnieszka","Ania","Dorota","Ewelina","Joanna","Kasia","Malgorzata","Monika","Natalia",
  "Paulina","Urszula","Zofia","Aleksandra","Beata","Celina","Edyta","Hanna","Irena","Jadwiga",
  "Justyna","Katarzyna","Lidia","Magdalena","Marta","Michalina","Oliwia","Patrycja","Renata",
  "Sylwia","Wanda","Zuzanna",
  "Adam","Bartosz","Cezary","Jakub","Krzysztof","Marek","Michal","Piotr","Szymon","Tomasz",
  "Wojciech","Artur","Damian","Filip","Grzegorz","Kamil","Karol","Krystian","Lukasz","Marcin",
  "Mateusz","Pawel","Przemek","Rafal","Robert","Sebastian","Stanislaw","Witold","Zbigniew",
  // ── Eastern European (Czech/Slovak) ──────────────────────────────────────
  "Barbora","Jana","Klara","Lenka","Lucie","Martina","Petra","Tereza","Veronika","Denisa",
  "Eva","Hana","Iveta","Jitka","Katerina","Lucie","Magdalena","Marketa","Renata","Zuzana",
  "Ales","Filip","Jan","Jiri","Josef","Lukas","Ondrej","Pavel","Vaclav","Zdenek","Martin",
  "Michal","Petr","Radek","Tomas","Vojtech",
  // ── Eastern European (Hungarian) ─────────────────────────────────────────
  "Agnes","Borbala","Eszter","Katalin","Krisztina","Zsofia","Anna","Erika","Eva","Gabriella",
  "Ildiko","Judit","Kinga","Monika","Nora","Reka","Szilvia","Timea","Veronika","Zita",
  "Bence","David","Gabor","Levente","Mate","Adam","Attila","Balazs","Denes","Ferenc","Gyorgy",
  "Istvan","Janos","Laszlo","Marton","Peter","Roland","Sandor","Tibor","Zoltan",
  // ── Eastern European (Romanian) ───────────────────────────────────────────
  "Adriana","Alina","Ana","Claudia","Diana","Elena","Ioana","Luminita","Maria","Mihaela",
  "Oana","Raluca","Ramona","Roxana","Ruxandra","Simona","Teodora","Valentina","Gabriela",
  "Alexandru","Andrei","Bogdan","Ciprian","Cosmin","Cristian","Florin","Ionut","Lucian",
  "Marian","Mihai","Mirel","Razvan","Sorin","Stefan","Traian","Vlad",
  // ── Eastern European (Croatian/Serbian/Balkan) ───────────────────────────
  "Adriana","Antonija","Dora","Irena","Ivana","Jelena","Katarina","Maja","Martina","Mirna",
  "Nikolina","Nina","Petra","Renata","Sandra","Tatjana","Tina","Valentina","Vesna","Zrinka",
  "Ante","Branko","Damir","Darko","Goran","Ivan","Kruno","Lovro","Luka","Marko","Matej",
  "Milan","Nikola","Stjepan","Sven","Tomislav","Viktor","Zlatko",
  // ── Russian & Ukrainian ───────────────────────────────────────────────────
  "Anastasia","Daria","Galina","Irina","Katya","Larisa","Lyudmila","Marina","Nadia","Natasha",
  "Olga","Oksana","Sofia","Sonya","Svetlana","Tatiana","Vera","Yelena","Yulia","Zoya",
  "Aleksei","Alexei","Andrei","Boris","Dmitri","Fyodor","Grigory","Igor","Ivan","Kirill",
  "Konstantin","Leonid","Mikhail","Nikolai","Pavel","Sergei","Vasily","Viktor","Vladimir","Yuri",
  // ── South Asian (Indian — Hindu/Sanskrit origin) ──────────────────────────
  "Aasha","Aarti","Aditi","Ananya","Anita","Anjali","Anushka","Arunima","Avani","Deepa",
  "Divya","Geeta","Harini","Kavya","Kiran","Komal","Lalita","Madhuri","Meera","Mitali",
  "Namita","Nandini","Nisha","Parvati","Pooja","Priya","Radha","Rekha","Rishita","Rohini",
  "Saanvi","Sandhya","Sanjana","Sarla","Seema","Shanti","Shreya","Sita","Sneha","Sonal",
  "Sonia","Sudha","Sunita","Swati","Tanvi","Tara","Uma","Usha","Vasudha","Vidya",
  "Aditya","Akhil","Anish","Arjun","Ashwin","Dev","Dhruv","Gaurav","Hari","Ishaan","Kabir",
  "Kartik","Krishna","Kunal","Manav","Mihir","Nikhil","Nilesh","Pranay","Prashant","Rahul",
  "Raj","Rajan","Rakesh","Rishi","Rohit","Sanjay","Saurabh","Suresh","Tarun","Varun",
  "Vijay","Vikram","Vinay","Vishal","Vivek","Aryan","Aakash","Deepak","Harshit","Jay",
  "Karthik","Mohit","Naveen","Neel","Pranav","Samir","Sandeep","Shiv","Shreyans","Tejas",
  // ── South Asian (Pakistani/Bangladeshi — Arabic/Urdu origin) ─────────────
  "Aisha","Amina","Fatima","Hafsa","Khadija","Layla","Maryam","Nadia","Noor","Rukhsana",
  "Sadia","Samina","Shabnam","Tabassum","Zainab","Zara","Ayesha","Bushra","Farida","Hina",
  "Javeria","Kiran","Maham","Munira","Nabeela","Rabab","Rabia","Sadaf","Saima","Sana",
  "Shagufta","Shazia","Sidra","Sumaira","Tahira","Uzma",
  "Ahmed","Ali","Asif","Bilal","Hamza","Hassan","Imran","Kamran","Khalid","Mahmood","Mohsin",
  "Muhammad","Omar","Raza","Tariq","Usman","Yusuf","Zubair","Aamir","Arslan","Aziz","Danish",
  "Faisal","Farrukh","Haroon","Ishaq","Junaid","Luqman","Mustafa","Naeem","Naveed","Salman",
  "Shoaib","Tahir","Umair","Wasim","Waqar","Zahid","Zeeshan",
  // ── East Asian (Japanese) ─────────────────────────────────────────────────
  "Aiko","Akemi","Akiko","Ami","Chiyo","Emiko","Fumiko","Hana","Hiromi","Kaede","Keiko",
  "Kimi","Kumiko","Makoto","Masako","Masumi","Michiko","Midori","Miku","Minako","Nana",
  "Nori","Reiko","Riko","Sachiko","Sakura","Satoko","Sayuri","Shizuka","Sora","Tomoko",
  "Yuki","Yuko","Yumi","Yumiko","Haruki","Hiro","Hiroshi","Kaito","Kenji","Naoki","Ren",
  "Ryu","Ryota","Shota","Sota","Takashi","Takumi","Tatsuya","Tomo","Yuta","Haruto","Kenta",
  "Minato","Naoya","Noboru","Osamu","Satoshi","Shinji","Taichi","Yasushi","Yoshiro","Yukio",
  // ── East Asian (Korean) ───────────────────────────────────────────────────
  "Bora","Chaeyeon","Dahyun","Eunji","Hana","Hyori","Hyunjin","Jisoo","Jiwon","Jiyeon",
  "Juhee","Minji","Minseo","Nayeon","Seoyeon","Serin","Sunhee","Sunmi","Taeyeon","Yoona",
  "Jimin","Hyun","Jae","Jaeho","Jihoon","Minho","Seokjin","Seunghyun","Sungjin","Taehyung",
  "Yoongi","Boyoung","Chaewon","Dahye","Eunha","Hyeji","Jieun","Jihye","Jisu","Joohyun",
  "Junghee","Mina","Minjung","Mirae","Miyeon","Seona","Sohee","Soojin","Sujeong","Yena",
  "Changhyun","Donghyun","Hyunwoo","Jiho","Junho","Juno","Kyungmin","Sanghyun","Seokjin",
  // ── East Asian (Chinese) ──────────────────────────────────────────────────
  "Fang","Hua","Jing","Jun","Lei","Liang","Lin","Ling","Liu","Mei","Ming","Na","Ning","Qian",
  "Qing","Rong","Shan","Shu","Wei","Wen","Xia","Xiao","Xin","Yan","Yang","Ye","Yi","Yu",
  "Yuan","Yue","Yun","Zhen","Zhi","Chen","Gang","Hao","Jiaming","Kai","Peng","Tao",
  "Bao","Cheng","Dong","Fei","Guang","Hai","Hong","Jian","Jie","Juan","Lan","Li","Lian",
  "Long","Qiu","Tian","Xiang","Xue","Zhen","Zheng",
  // ── Arabic & Middle Eastern ───────────────────────────────────────────────
  "Almaz","Amira","Dalia","Dalila","Dina","Hana","Hoda","Huda","Inaya","Jasmine","Laila",
  "Leila","Lina","Malak","Mariam","Mona","Nour","Reem","Rima","Salma","Sara","Sirine",
  "Yasmine","Alaa","Amani","Asma","Basma","Duha","Eman","Ghada","Heba","Hibah","Hind",
  "Lamia","Lujain","Manar","May","Maysa","Nada","Nawal","Ola","Rahaf","Rama","Rania",
  "Rawda","Riham","Rina","Sahar","Samira","Shadia","Shirin","Yara","Zahra","Zeinab",
  "Abdullah","Ahmad","Akram","Basel","Faris","Ibrahim","Kareem","Khalid","Khaled","Mahmoud",
  "Rami","Samir","Tarek","Wael","Yousef","Amr","Badr","Fadi","Ghassan","Hani","Hazem",
  "Hussain","Imad","Jihad","Kamal","Louay","Mahdi","Munir","Nasser","Nidal","Qais","Ramzi",
  "Samer","Sherif","Shadi","Tamer","Walid","Wissam","Yazan","Ziad",
  // ── Hebrew & Israeli ──────────────────────────────────────────────────────
  "Abigail","Adina","Batya","Dina","Dvora","Hana","Keren","Leah","Liora","Miriam","Naomi",
  "Noa","Rachel","Raya","Reut","Ruth","Shira","Tamar","Tova","Yael","Ziva","Ayelet","Daphna",
  "Galit","Gila","Hagit","Inbal","Irit","Kochav","Liat","Meital","Michal","Ofra","Orly",
  "Pazit","Rivka","Ronit","Sarit","Shimrit","Sigal","Tali","Tzila","Yehudit",
  "Avi","Ben","Dan","David","Elan","Eliad","Eyal","Gil","Gal","Ido","Itay","Jonathan","Lior",
  "Matan","Nadav","Noam","Nir","Ohad","Oren","Raz","Ron","Shachar","Tal","Uri","Yair","Yam",
  "Yonatan","Amir","Amos","Aran","Ariel","Arik","Barak","Boaz","Dror","Gidon","Guy","Hillel",
  "Ilan","Itai","Kobi","Lev","Meir","Moshe","Ofir","Omri","Ram","Roee","Shai","Shaul",
  "Shimon","Yehuda","Yuval","Ziv",
  // ── West African (Yoruba/Igbo/Akan) ──────────────────────────────────────
  "Abeni","Adaeze","Adaora","Adeola","Adunola","Afua","Amara","Chidinma","Chika","Chioma",
  "Chinwe","Damilola","Funmilayo","Ifeoma","Kehinde","Ngozi","Nkechi","Nneka","Olamide",
  "Omolara","Sade","Taiwo","Tobi","Toluwani","Yetunde","Yinka","Akosua","Akua","Ama","Ama",
  "Abena","Adwoa","Adjoa","Akosua","Abenaa","Akua","Amma","Araba","Efua","Esi","Ewurama",
  "Maame","Mansah","Memuna","Naana","Nhyira","Nkrumah","Odarteye","Ohemaa",
  "Adebayo","Adewale","Babatunde","Chukwuemeka","Damilare","Emeka","Ife","Jide","Kayode",
  "Kelechi","Kunle","Lanre","Nnamdi","Obinna","Olu","Seun","Tayo","Toyin","Wale","Yemi",
  "Abiodun","Abioye","Adekunle","Ademola","Adeniyi","Adetutu","Adeyemi","Afolabi","Akin",
  "Biodun","Chidi","Femi","Gbenga","Godswill","Ifeanyi","Kazeem","Lekan","Oluwafemi","Temitope",
  // ── East African (Swahili/Kenyan/Tanzanian) ───────────────────────────────
  "Amani","Baraka","Dalila","Fatuma","Furaha","Halima","Imani","Makena","Mwende","Njeri",
  "Pendo","Rehema","Saida","Wangari","Zawadi","Aisha","Amina","Fadhila","Hadiya","Husna",
  "Khadija","Latifa","Lulu","Maryam","Nadia","Nuru","Rahma","Safia","Salama","Shukrani",
  "Bahati","Hamisi","Jabari","Kamau","Kariuki","Makau","Mwangi","Njoroge","Said","Sefu",
  "Wanjiku","Abdi","Bakari","Farouk","Hassan","Idris","Juma","Khalil","Musa","Omar","Rashid",
  // ── Southern African (Zulu/Xhosa/Ndebele/Sotho) ───────────────────────────
  "Amahle","Andile","Bongiwe","Buhle","Busisiwe","Duduzile","Futhi","Gugu","Khanyisile",
  "Lindiwe","Lungile","Nandi","Nomsa","Nomvula","Phindile","Sibongile","Sindisiwe","Thandeka",
  "Thandi","Zinhle","Nokwanda","Nokukhanya","Nombuso","Nonhlanhla","Nontobeko","Nomalanga",
  "Andile","Bongani","Dumisani","Lungelo","Lungisa","Mthokozisi","Musa","Njabulo","Sandile",
  "Sifiso","Sipho","Siyanda","Thabo","Themba","Zakhele","Bhekani","Bonginkosi","Cebo",
  "Dalisu","Fanele","Gcinumusa","Hlanganani","Khulekani","Lungelo","Mlondi","Mondli","Mthokozisi",
  // ── Latin American (additional) ───────────────────────────────────────────
  "Camila","Carolina","Cecilia","Daniela","Flor","Gabriela","Gianna","Isabella","Jimena",
  "Juanita","Lola","Lorena","Luisa","Luna","Manuela","Marisol","Paola","Rosa","Valeria","Carla",
  "Fernanda","Mariela","Natalia","Rebeca","Rocio","Romina","Sabrina","Soledad","Veronica",
  "Gonzalo","Hernan","Julio","Marcos","Miguel","Ramon","Rodrigo","Tomas","Victor","Matias",
  "Nicolas","Leandro","Luciano","Maximiliano","Emiliano","Fabian","Gaston","Osvaldo","Ruben",
  // ── Oceanic/Pacific (Maori/Samoan/Fijian/Hawaiian) ────────────────────────
  "Aroha","Hine","Kiri","Kuini","Marama","Mere","Ngaio","Roimata","Sina","Teuila",
  "Ataahua","Hemi","Hoani","Ihaka","Kupe","Matiu","Piripi","Rangi","Raukura","Tama","Tane",
  "Wiremu","Aotearoa","Moana","Pita","Kealoha","Leilani","Kalani","Malia","Noelani","Pomaika",
  "Alisi","Adi","Asena","Litia","Makereta","Naomi","Salote","Sela","Vasiti",
  // ── Greek ────────────────────────────────────────────────────────────────
  "Alexandra","Aliki","Calliope","Daphne","Despina","Dimitra","Eleni","Evangelia","Georgia",
  "Ioanna","Irene","Katerina","Konstantina","Kyriaki","Magdalini","Maria","Melina","Natalia",
  "Nike","Olympia","Penelope","Roxani","Sofia","Stavroula","Theodora","Xenia","Zoe",
  "Christos","Dimitris","Evangelos","Giorgos","Giannis","Konstantinos","Kostas","Kyriakos",
  "Lefteris","Leonidas","Manolis","Nikos","Petros","Stavros","Thanasis","Vassilis","Yannis",
  // ── Turkish ──────────────────────────────────────────────────────────────
  "Arzu","Aylin","Ayse","Bahar","Burcu","Ceren","Deniz","Ebru","Ece","Elif","Esra","Fatma",
  "Filiz","Gamze","Gulcin","Hatice","Hülya","Inci","Ipek","Melis","Merve","Mine","Nazli",
  "Neslihan","Nihal","Nur","Pinar","Selin","Sema","Sevgi","Yildiz","Zeynep","Zümrüt",
  "Ahmet","Berk","Burak","Emre","Engin","Erdem","Erkan","Hasan","Kemal","Mehmet","Mert",
  "Murat","Mustafa","Oguz","Onur","Ozan","Serkan","Serhat","Tarik","Tolga","Tugrul","Ufuk",
  "Umut","Volkan","Yusuf","Zafer",
  // ── Persian/Iranian ───────────────────────────────────────────────────────
  "Afsaneh","Anahita","Arash","Azadeh","Azin","Bahar","Darya","Elham","Farideh","Fatemeh",
  "Golnaz","Hana","Leila","Mahsa","Mahtab","Maryam","Nastaran","Neda","Niloofar","Parisa",
  "Roya","Sahar","Sanaz","Sepideh","Setareh","Shadi","Shirin","Tara","Yasaman","Zahra",
  "Arash","Arman","Dariush","Farhad","Hamid","Hossein","Javad","Kamran","Kian","Mehdi",
  "Mohammad","Navid","Omid","Pedram","Pejman","Reza","Roozbeh","Saeed","Shahram","Siavash",
  // ── Armenian & Georgian ───────────────────────────────────────────────────
  "Ani","Anahit","Armenuhi","Gayane","Hasmik","Lusine","Mariam","Nane","Nvard","Satenik","Tamar",
  "Aram","Armen","Gagik","Hakob","Hovhannes","Khachatur","Levon","Samvel","Tigran","Vardan",
  "Ana","Ekaterine","Elene","Ketevan","Lela","Manana","Marina","Nana","Nino","Salome","Sopho",
  "Archil","Davit","Giorgi","Irakli","Levan","Luka","Mikheil","Nikoloz","Sandro","Tornike",
  // ── Scandinavian (additional/Old Norse) ──────────────────────────────────
  "Bodil","Dagmar","Gudrun","Gunhild","Halfdan","Ingirid","Ragnhild","Sigrid","Solveig","Thyra",
  "Ulf","Gunnar","Bjoern","Rolf","Sigurd","Ragnar","Ivar","Leif","Njord","Torkel",
  // ── Global gender-neutral & short forms ──────────────────────────────────
  "Alex","Ash","Bay","Blair","Cam","Casey","Charlie","Chris","Claude","Corey","Dale","Dana",
  "Drew","Eden","Ellis","Emery","Evan","Finley","Gene","Harley","Hayden","Hunter","Indigo",
  "Jesse","Jordan","Jules","Kai","Lake","Lane","Lee","Logan","Lou","Luca","Max","Morgan",
  "Noel","Page","Pat","Perry","Phoenix","Quinn","Rain","Reed","Reese","Remy","Rio","Robin",
  "Rowan","Sage","Sam","Sandy","Shea","Skyler","Spencer","Storm","Taylor","Tegan","Tierney",
  "Tobin","Tory","Tyler","Val","Wren","Zen",
];

// Deduplicate, validate, and sort
const seen = new Set<string>();
export const NAMES: string[] = NAMES_RAW
  .filter(name => {
    if (!name || name.length < 2 || name.length > 20) return false;
    if (!/^[A-Za-z]+$/.test(name)) return false;
    const key = name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .sort((a, b) => a.localeCompare(b));

export default NAMES;
