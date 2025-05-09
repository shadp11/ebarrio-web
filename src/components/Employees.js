import { useRef, useState, useEffect, useContext } from "react";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import CreateEmployee from "./CreateEmployee";
import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";
import "../Stylesheets/Employees.css";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import EmployeeIDFront from "../assets/employeeidfront.png";
import EmployeeIDBack from "../assets/employeeidback.png";
import ReactDOM from "react-dom/client";
import { useConfirm } from "../context/ConfirmContext";
import api from "../api";

function Employees({ isCollapsed }) {
  const confirm = useConfirm();
  const navigation = useNavigate();
  const { fetchEmployees, employees } = useContext(InfoContext);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isCertClicked, setCertClicked] = useState(false);
  const [isCreateClicked, setCreateClicked] = useState(false);
  const [selectedResID, setSelectedResID] = useState(null);
  const [search, setSearch] = useState("");

  const handleRowClick = (residentId) => {
    setExpandedRow(expandedRow === residentId ? null : residentId);
  };

  async function uploadToFirebase(url) {
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `id_qrcode/${Date.now()}_${randomString}.png`;
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  }

  const handleEmployeeID = async (e, empID) => {
    e.stopPropagation();
    const action = await confirm(
      "Do you want to print the current employee ID or generate a new one?",
      "id"
    );

    if (action === "cancel") {
      return;
    }

    if (action === "generate") {
      try {
        const response = await api.post(`/generateemployeeID/${empID}`);
        const qrCode = await uploadToFirebase(response.data.qrCode);

        try {
          const response2 = await api.put(`/saveemployeeID/${empID}`, {
            idNumber: response.data.idNumber,
            expirationDate: response.data.expirationDate,
            qrCode,
            qrToken: response.data.qrToken,
          });
          try {
            const response = await api.get(`/getemployee/${empID}`);
            const response2 = await api.get(`/getcaptain/`);
            const printContent = (
              <div id="printContent">
                <div className="id-page">
                  <div
                    style={{
                      position: "absolute",
                      top: "65px",
                      left: "60px",
                      width: "80px",
                      height: "75px",
                    }}
                  >
                    <img
                      style={{ width: "100%", height: "100%" }}
                      src={response.data.resID.picture}
                    />
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      top: "150px",
                      left: "28px",
                      width: "150px",
                      height: "40px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {response.data.resID.middlename
                        ? `${
                            response.data.resID.firstname
                          } ${response.data.resID.middlename.substring(
                            0,
                            1
                          )}. ${response.data.resID.lastname}`
                        : `${response.data.resID.firstname} ${response.data.resID.lastname}`}
                    </p>
                    <p style={{ fontSize: "11px", textAlign: "center" }}>
                      {response.data.position}
                    </p>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      top: "220px",
                      left: "41px",
                      width: "40px",
                      height: "40px",
                    }}
                  >
                    <img
                      style={{ width: "100%", height: "100%" }}
                      src={response.data.employeeID[0]?.qrCode}
                    />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      top: "266px",
                      left: "41px",
                      width: "70px",
                      height: "10px",
                    }}
                  >
                    <p style={{ fontSize: "8px" }}>
                      {response.data.resID.brgyID[0]?.idNumber}
                    </p>
                  </div>
                  <img className="id-img" src={EmployeeIDFront} />
                </div>
                <div className="id-page">
                  <div
                    style={{
                      position: "absolute",
                      top: "467px",
                      left: "30px",
                      width: "150px",
                      height: "70px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      flexDirection: "column",
                    }}
                  >
                    <img
                      style={{
                        position: "absolute",
                        width: "80px",
                        height: "80px",
                      }}
                      src={response2.data.resID.signature}
                    />
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {response2.data.resID.firstname}{" "}
                      {response2.data.resID.lastname}
                    </p>
                  </div>
                  <img className="id-img" src={EmployeeIDBack} />
                </div>
              </div>
            );

            const printDiv = document.createElement("div");
            document.body.appendChild(printDiv);

            const root = ReactDOM.createRoot(printDiv);
            root.render(printContent);

            const printStyle = document.createElement("style");
            printStyle.innerHTML = `
                  @page {
                    size: 54mm 86mm;
                    margin: 0;
                  }
            
                 @media screen {
                  #printContent, #printContent * {
                    display: none;
                  }
                }
                  @media print {
                    html, body {
                      margin: 0 !important;
                      padding: 0 !important;
                      width: 54mm !important;
                      height: 86mm !important;
                      overflow: hidden !important;
                    }
            
                    body * {
                      visibility: hidden;
                    }
            
                    #printContent, #printContent * {
                      visibility: visible;
                    }
            
                    #printContent {
                      position: absolute;
                      top: 0;
                      left: 0;
                      width: 54mm;
                      height: 86mm;
                    }
            
                    .id-page {
                      width: 54mm;
                      height: 86mm;
                      overflow: hidden;
                      margin: 0;
                      padding: 0;
                      page-break-after: avoid;
                    }
            
                    .id-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                  }
            
                `;

            document.head.appendChild(printStyle);

            window.onbeforeprint = () => {
              console.log("Barangay ID is generated.");
            };
            window.onafterprint = () => {
              console.log("Barangay ID is issued.");
              document.body.removeChild(printDiv);
              document.head.removeChild(printStyle);
            };

            setTimeout(() => {
              window.print();
            }, 1000);
          } catch (error) {
            console.log("Error viewing current employee ID", error);
          }
        } catch (error) {
          console.log("Error saving employee ID", error);
        }
      } catch (error) {
        console.log("Error generating employee ID", error);
      }
    } else if (action === "current") {
      try {
        const response = await api.get(`/getemployee/${empID}`);
        const response2 = await api.get(`/getcaptain/`);
        const printContent = (
          <div id="printContent">
            <div className="id-page">
              <div
                style={{
                  position: "absolute",
                  top: "65px",
                  left: "60px",
                  width: "80px",
                  height: "75px",
                }}
              >
                <img
                  style={{ width: "100%", height: "100%" }}
                  src={response.data.resID.picture}
                />
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "150px",
                  left: "28px",
                  width: "150px",
                  height: "40px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {response.data.resID.middlename
                    ? `${
                        response.data.resID.firstname
                      } ${response.data.resID.middlename.substring(0, 1)}. ${
                        response.data.resID.lastname
                      }`
                    : `${response.data.resID.firstname} ${response.data.resID.lastname}`}
                </p>
                <p style={{ fontSize: "11px", textAlign: "center" }}>
                  {response.data.position}
                </p>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "220px",
                  left: "41px",
                  width: "40px",
                  height: "40px",
                }}
              >
                <img
                  style={{ width: "100%", height: "100%" }}
                  src={response.data.employeeID[0]?.qrCode}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "266px",
                  left: "41px",
                  width: "70px",
                  height: "10px",
                }}
              >
                <p style={{ fontSize: "8px" }}>
                  {response.data.employeeID[0]?.idNumber}
                </p>
              </div>
              <img className="id-img" src={EmployeeIDFront} />
            </div>
            <div className="id-page">
              <div
                style={{
                  position: "absolute",
                  top: "467px",
                  left: "30px",
                  width: "150px",
                  height: "70px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  flexDirection: "column",
                }}
              >
                <img
                  style={{
                    position: "absolute",
                    width: "80px",
                    height: "80px",
                  }}
                  src={response2.data.resID.signature}
                />
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {response2.data.resID.firstname}{" "}
                  {response2.data.resID.lastname}
                </p>
              </div>
              <img className="id-img" src={EmployeeIDBack} />
            </div>
          </div>
        );

        const printDiv = document.createElement("div");
        document.body.appendChild(printDiv);

        const root = ReactDOM.createRoot(printDiv);
        root.render(printContent);

        const printStyle = document.createElement("style");
        printStyle.innerHTML = `
              @page {
                size: 54mm 86mm;
                margin: 0;
              }
        
             @media screen {
              #printContent, #printContent * {
                display: none;
              }
            }
              @media print {
                html, body {
                  margin: 0 !important;
                  padding: 0 !important;
                  width: 54mm !important;
                  height: 86mm !important;
                  overflow: hidden !important;
                }
        
                body * {
                  visibility: hidden;
                }
        
                #printContent, #printContent * {
                  visibility: visible;
                }
        
                #printContent {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 54mm;
                  height: 86mm;
                }
        
                .id-page {
                  width: 54mm;
                  height: 86mm;
                  overflow: hidden;
                  margin: 0;
                  padding: 0;
                  page-break-after: avoid;
                }
        
                .id-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
              }
        
            `;

        document.head.appendChild(printStyle);

        window.onbeforeprint = () => {
          console.log("Barangay ID is generated.");
        };
        window.onafterprint = () => {
          console.log("Barangay ID is issued.");
          document.body.removeChild(printDiv);
          document.head.removeChild(printStyle);
        };

        setTimeout(() => {
          window.print();
        }, 1000);
      } catch (error) {
        console.log("Error viewing current employee ID", error);
      }
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAdd = () => {
    setCreateClicked(true);
  };

  const archiveBtn = async (e, empID) => {
    e.stopPropagation();
    const isConfirmed = await confirm(
      "Are you sure you want to archive this employee?",
      "confirmred"
    );
    if (isConfirmed) {
      try {
        const response = await api.delete(`/archiveemployee/${empID}`);
        alert("Employee successfully archived");
      } catch (error) {
        console.log("Error", error);
      }
    }
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
      const filtered = employees.filter((emp) => {
        const first = emp.resID.firstname || "";
        const middle = emp.resID.middlename || "";
        const last = emp.resID.lastname || "";
        const position = emp.position || "";

        const fullName = `${first} ${middle} ${last}`.trim();

        return fullName.includes(search) || position.includes(search);
      });
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [search, employees]);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Employees</div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />

        <button className="add-btn" onClick={handleAdd}>
          <MdPersonAddAlt1 className=" text-xl" />
          <span className="font-bold">Add new employee</span>
        </button>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Mobile No.</th>
              <th>Address</th>
              <th>Position</th>
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {filteredEmployees.length === 0 ? (
              <tr className="bg-white">
                <td colSpan={4}>No results found</td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <React.Fragment key={emp._id}>
                  <tr
                    onClick={() => handleRowClick(emp._id)}
                    className="border-t transition-colors duration-300 ease-in-out"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0f0f0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                    }}
                  >
                    {expandedRow === emp._id ? (
                      <td colSpan={4}>
                        {/* Additional Information for the resident */}
                        <div className="profile-container">
                          <img
                            src={emp.resID.picture}
                            className="profile-img"
                          />
                          <div className="ml-5 text-xs">
                            <p>
                              <strong>Name: </strong>
                              {emp.resID.middlename
                                ? `${emp.resID.firstname} ${emp.resID.middlename} ${emp.resID.lastname}`
                                : `${emp.resID.firstname} ${emp.resID.lastname}`}
                            </p>
                            <p>
                              <strong>Age:</strong> {emp.resID.age}
                            </p>
                            <p>
                              <strong>Sex:</strong> {emp.resID.sex}
                            </p>
                            <p>
                              <strong>Civil Status: </strong>{" "}
                              {emp.resID.civilstatus}
                            </p>
                            <p>
                              <strong>Mobile Number: </strong>{" "}
                              {emp.resID.mobilenumber}
                            </p>
                            <p>
                              <strong>Address: </strong> {emp.resID.address}
                            </p>
                            <p>
                              <strong>Position: </strong> {emp.position}
                            </p>
                          </div>
                          <div className="ml-5 text-xs">
                            <p>
                              <strong>Emergency Contact:</strong>
                            </p>
                            <p>
                              <strong>Name: </strong>
                              {emp.resID.emergencyname}
                            </p>
                            <p>
                              <strong>Mobile: </strong>
                              {emp.resID.emergencymobilenumber}
                            </p>
                            <p>
                              <strong>Address: </strong>
                              {emp.resID.emergencyaddress}
                            </p>
                          </div>
                        </div>
                        <div className="btn-container">
                          <button
                            className="actions-btn bg-btn-color-red"
                            type="submit"
                            onClick={(e) => archiveBtn(e, emp._id)}
                          >
                            ARCHIVE
                          </button>
                          <button
                            className="actions-btn bg-btn-color-blue"
                            type="submit"
                            onClick={(e) => handleEmployeeID(e, emp._id)}
                          >
                            EMPLOYEE ID
                          </button>
                          <button
                            className="actions-btn bg-btn-color-blue"
                            type="submit"
                            // onClick={() => editBtn(emp._id)}
                          >
                            EDIT
                          </button>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td>
                          {emp.resID.middlename
                            ? `${emp.resID.lastname} ${emp.resID.middlename} ${emp.resID.firstname}`
                            : `${emp.resID.lastname} ${emp.resID.firstname}`}
                        </td>
                        <td>{emp.resID.mobilenumber}</td>
                        <td>{emp.resID.address}</td>
                        <td>{emp.position}</td>
                      </>
                    )}
                  </tr>
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
        {isCreateClicked && (
          <CreateEmployee onClose={() => setCreateClicked(false)} />
        )}
      </main>
    </>
  );
}

export default Employees;
