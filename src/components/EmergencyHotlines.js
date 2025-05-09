import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/CommonStyle.css";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import CreateContact from "./CreateContact";
import EditContact from "./EditContact";
import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";
import { useConfirm } from "../context/ConfirmContext";
import api from "../api";

//ICONS
import { FaArchive, FaEdit } from "react-icons/fa";
import { IoArchiveSharp } from "react-icons/io5";

function EmergencyHotlines({ isCollapsed }) {
  const confirm = useConfirm();
  const navigation = useNavigate();
  const { fetchEmergencyHotlines, emergencyhotlines } = useContext(InfoContext);
  const [filteredEmergencyHotlines, setFilteredEmergencyHotlines] = useState(
    []
  );
  const [isCreateClicked, setCreateClicked] = useState(false);
  const [isEditClicked, setEditClicked] = useState(false);
  const [selectedEmergencyID, setSelectedEmergencyID] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEmergencyHotlines();
  }, []);

  const handleAdd = () => {
    setCreateClicked(true);
  };

  const handleArchive = async (emergencyID) => {
    const isConfirmed = await confirm(
      "Are you sure you want to archive this emergency contact?",
      "confirmred"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      const response = await api.delete(
        `/archiveemergencyhotlines/${emergencyID}`
      );
      alert("Emergency contact successfully archived!");
    } catch (error) {
      console.log("Error archiving emergency contact", error);
    }
  };

  const handleEdit = (emergencyID, name, contactnumber) => {
    setEditClicked(true);
    setSelectedEmergencyID(emergencyID);
    setSelectedEmergency({ name: name, contactnumber: contactnumber });
  };

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z\s.]/g, "");
    const formattedText = sanitizedText
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    setSearch(formattedText);
  };

  useEffect(() => {
    if (search) {
      const filtered = emergencyhotlines.filter((emergency) => {
        return emergency.name.includes(search);
      });
      setFilteredEmergencyHotlines(filtered);
    } else {
      setFilteredEmergencyHotlines(emergencyhotlines);
    }
  }, [search, emergencyhotlines]);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Emergency Hotlines</div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />
        <button className="add-btn" onClick={handleAdd}>
          <MdPersonAddAlt1 className=" text-xl" />
          <span className="font-bold">Add new contact</span>
        </button>
        <hr className="mt-4 border border-gray-300" />

        <table>
          <thead>
            <tr>
              <th>Public Service Facilities</th>
              <th>Contact Number</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {filteredEmergencyHotlines.length === 0 ? (
              <tr>
                <td colSpan={3}>No results found</td>
              </tr>
            ) : (
              filteredEmergencyHotlines.map((emergency) => (
                <tr
                  key={emergency._id}
                  className="border-t transition-colors duration-300 ease-in-out"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                  }}
                >
                  <td>{emergency.name}</td>
                  <td>{emergency.contactnumber}</td>
                  <td className="flex justify-center gap-x-8">
                    <div className="table-actions-container">
                      <button
                        type="button"
                        className="table-actions-btn"
                        onClick={() =>
                          handleEdit(
                            emergency._id,
                            emergency.name,
                            emergency.contactnumber
                          )
                        }
                      >
                        <FaEdit className="text-xl text-[#06D001]" />
                        <label className="text-xs font-semibold text-[#06D001]">
                          Edit
                        </label>
                      </button>
                    </div>

                    <div className="table-actions-container">
                      <button
                        type="button"
                        className="table-actions-btn"
                        onClick={() => handleArchive(emergency._id)}
                      >
                        <FaArchive className="text-xl text-btn-color-red" />
                        <label className="text-xs font-semibold text-btn-color-red">
                          Archive
                        </label>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {isCreateClicked && (
          <CreateContact onClose={() => setCreateClicked(false)} />
        )}
        {isEditClicked && (
          <EditContact
            onClose={() => setEditClicked(false)}
            emergencyID={selectedEmergencyID}
            emergencyDetails={selectedEmergency}
          />
        )}
      </main>
    </>
  );
}

export default EmergencyHotlines;
