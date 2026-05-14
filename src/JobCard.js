import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function JobCard() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [notes, setNotes] = useState("");
  const [labour, setLabour] = useState(0);

  useEffect(() => {
    const loadJob = async () => {
      const ref = doc(db, "jobs", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setJob({ id: snap.id, ...snap.data() });
      }
    };

    loadJob();
  }, [id]);

  if (!job) return <div style={{ color: "white" }}>Loading...</div>;

  const total = Number(job.price) + Number(labour);

  const completeJob = async () => {
    const ref = doc(db, "jobs", id);

    await updateDoc(ref, {
      notes,
      labour,
      total,
      status: "done"
    });

    alert("Job Completed ✅");
    window.location.href = "/dashboard";
  };

  return (
    <div style={{
      background: "linear-gradient(to bottom right, black, #0f172a)",
      color: "white",
      minHeight: "100vh",
      padding: "20px"
    }}>

      <div style={{
        background: "#111827",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #1f2937"
      }}>

        <h1 style={{ color: "#facc15" }}>Job Card</h1>

        <h2>{job.name}</h2>
        <p>{job.phone}</p>
        <p>{job.reg}</p>

        <p style={{ color: "#facc15", fontWeight: "bold" }}>
          {job.tyre}
        </p>

        <p>£{job.price}</p>

        <textarea
          placeholder="Work carried out..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{
            width: "100%",
            height: "100px",
            marginTop: "10px",
            padding: "10px"
          }}
        />

        <input
          type="number"
          placeholder="Labour £"
          value={labour}
          onChange={(e) => setLabour(e.target.value)}
          style={{
            width: "100%",
            marginTop: "10px",
            padding: "10px"
          }}
        />

        <h2 style={{ marginTop: "10px" }}>
          Total: <span style={{ color: "#facc15" }}>£{total}</span>
        </h2>

        <button
          onClick={completeJob}
          style={{
            background: "#facc15",
            color: "black",
            padding: "12px",
            fontWeight: "bold",
            width: "100%",
            marginTop: "10px",
            borderRadius: "8px"
          }}
        >
          Complete & Invoice
        </button>

      </div>
    </div>
  );
}