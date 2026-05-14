import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Admin() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "jobs"));
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(data);
    };

    fetch();
  }, []);

  return (
    <div style={{padding:"40px",background:"#000",color:"#fff"}}>

      <h1>Garage Dashboard</h1>

      {jobs.map(job => (
        <div key={job.id} style={{
          background:"#111",
          padding:"20px",
          marginBottom:"10px",
          borderRadius:"10px"
        }}>
          <p><strong>{job.service}</strong></p>
          <p>{job.date} - {job.time}</p>
          <p>{job.name} ({job.phone})</p>
        </div>
      ))}

    </div>
  );
}