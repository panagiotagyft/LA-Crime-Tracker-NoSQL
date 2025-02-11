import './Queries.css';
import Query1 from '../../components/query1/Query1';
import Query2 from '../../components/query2/Query2';
import Query3 from '../../components/query3/Query3';
import Query4 from '../../components/query4/Query4';
import Query5 from '../../components/query5/Query5';
import Query6 from '../../components/query6/Query6';
import Query7 from '../../components/query7/Query7';
import Query8 from '../../components/query8/Query8';
import Query9 from '../../components/query9/Query9';
import Query10 from '../../components/query10/Query10';


import UserNavbar from '../../components/navbar/UserNavbar'; 

export default function Queries() {
  const userEmail = 'user@example.com';

  const handleLogout = () => {
    console.log('User logged out');
  };

  const forms = [
    <Query1 key="form1" />,
    <Query2 key="form2" />,
    <Query3 key="form3" />,
    <Query4 key="form4" />,
    <Query5 key="form5" />,
    <Query6 key="form6" />,
    <Query7 key="form7" />,
    <Query8 key="form8" />,
    <Query9 key="form9" />,
    <Query10 key="form10" />,
  ];

  return (
    <div className='queries'>
      <UserNavbar userEmail={userEmail} onLogout={handleLogout} /> {/* Προσθήκη του Navbar */}
      <div className='queriesWrapper'>
        <div className='queriesForm'> 
          {forms.map((form, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              {form}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
