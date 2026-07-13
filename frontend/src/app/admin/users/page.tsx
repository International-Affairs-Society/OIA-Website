"use client";
import React, { useState, useEffect } from "react";
import { AdminPageHeader, AdminTable, ActionButtons, FilterBar } from "@/app/admin/components";
import { useAuth } from "@/app/admin/roles/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function UsersPage() {
  const { role } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_URL}/api/v1/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setUsers((data.data || []).map((u: any) => ({
            id: u.id,
            name: u.display_name || u.email,
            email: u.email,
            role: u.role || "viewer",
            phoneNumber: u.phone_number || "",
            department: u.course || u.school || "",
          })));
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const columns = [
    { key: "name", label: "Name", width: "20%" },
    { key: "phoneNumber", label: "Phone Number", width: "20%" },
    { key: "department", label: "Department", width: "15%" },
    { key: "email", label: "Email", width: "25%" },
    { key: "role", label: "Role", width: "20%" },
  ];

  const handleDelete = (id: string) => {
    if (id === "1") {
      alert("You cannot delete your own account.");
      return;
    }
    setUsers(users.filter(u => u.id !== id));
  };

  const data = users.map(user => ({
    id: user.id,
    name: user.name,
    phoneNumber: (user as any).phoneNumber || "+91 9876543210",
    department: (user as any).department || "Computer Science",
    email: user.email,
    role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
  }));

  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isConfirmingAdd, setIsConfirmingAdd] = useState(false);
  
  const [newRoleData, setNewRoleData] = useState({
    id: "",
    name: "",
    phoneNumber: "",
    department: "",
    email: "",
    role: "Admin"
  });

  const handleOpenAddModal = () => {
    setModalMode("add");
    setIsModalOpen(true);
    setNewRoleData({ id: "", name: "", phoneNumber: "", department: "", email: "", role: "Admin" });
    setIsConfirmingAdd(false);
  };

  const handleOpenEditModal = (user: any) => {
    setModalMode("edit");
    setIsModalOpen(true);
    setNewRoleData({ 
      id: user.id, 
      name: user.name, 
      phoneNumber: user.phoneNumber || "+91 9876543210", 
      department: user.department || "Computer Science",
      email: user.email, 
      role: user.role 
    });
    setIsConfirmingAdd(false);
  };

  const handleAddRoleClick = () => {
    if (!newRoleData.name || !newRoleData.email || !newRoleData.role || !newRoleData.phoneNumber || !newRoleData.department) {
      alert("Please fill all required fields.");
      return;
    }
    setIsConfirmingAdd(true);
  };

  const handleConfirmAdd = () => {
    if (modalMode === "add") {
      // Add to list
      const newUser = {
        id: Date.now().toString(),
        name: newRoleData.name,
        phoneNumber: newRoleData.phoneNumber,
        department: newRoleData.department,
        email: newRoleData.email,
        role: newRoleData.role.toLowerCase()
      };
      setUsers([...users, newUser as any]);
    } else {
      // Update existing
      setUsers(users.map(u => u.id === newRoleData.id ? {
        ...u,
        name: newRoleData.name,
        phoneNumber: newRoleData.phoneNumber,
        department: newRoleData.department,
        email: newRoleData.email,
        role: newRoleData.role.toLowerCase()
      } : u));
    }
    setIsConfirmingAdd(false);
    setIsModalOpen(false);
  };

  const handleCancelAdd = () => {
    setIsConfirmingAdd(false);
    setIsModalOpen(false);
  };

  return (
    <div style={{ width: "100%", maxWidth: "100%", transition: "width 0.3s ease" }}>
      <AdminPageHeader title="Users" />

      <FilterBar
        searchPlaceholder="Search by name or email..."
        filters={[{ key: "role", label: "All Roles", options: [{ label: "Admin", value: "admin" }, { label: "Super Admin", value: "super admin" }, { label: "Viewer", value: "viewer" }, { label: "Editor", value: "editor" }] }]}
        sortOptions={[{ label: "Name (A-Z)", value: "name_asc" }, { label: "Email", value: "email_asc" }]}
        extraRightNode={
          <button
            onClick={handleOpenAddModal}
            style={{
              padding: "10px 24px",
              backgroundColor: "#b5bda0",
              color: "#1a1a1a",
              border: "1px solid #9ca386",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#9ca386";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#b5bda0";
            }}
          >
            Add Role
          </button>
        }
      />

      <div style={{ border: "1px solid #b5bda0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <AdminTable
          columns={columns}
          data={data}
          actions={(row: any) => (
            <ActionButtons
              rowId={row.id}
              confirmingDeleteId={confirmingId}
              setConfirmingDeleteId={role === 'super_admin' ? setConfirmingId : undefined}
              onUpdateRole={() => handleOpenEditModal(row)}
              onConfirmDelete={role === 'super_admin' ? handleDelete : undefined}
              onCancelDelete={role === 'super_admin' ? () => setConfirmingId(null) : undefined}
            />
          )}
        />
      </div>

      {/* Centered Horizontal Modal */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{
            width: "50%",
            minWidth: "600px",
            backgroundColor: "#f5f0e8", // beige
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            borderTop: "8px solid #b5bda0", // olive accent
            borderRadius: "8px",
            animation: "fadeIn 0.2s ease-out forwards"
          }}>
            <h2 style={{ color: "#1a1a1a", fontSize: "24px", fontWeight: 600, margin: "0 0 24px 0", borderBottom: "1px solid #b5bda0", paddingBottom: "12px" }}>
              {modalMode === "add" ? "Add a new role" : "Update user role"}
            </h2>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b6b6b", marginBottom: "6px" }}>NAME</label>
                  <input 
                    type="text" 
                    value={newRoleData.name}
                    onChange={(e) => setNewRoleData({...newRoleData, name: e.target.value})}
                    style={{ width: "100%", padding: "10px", border: "1px solid #b5bda0", backgroundColor: "#fff", outline: "none", borderRadius: "4px" }} 
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b6b6b", marginBottom: "6px" }}>PHONE NUMBER (WITH COUNTRY CODE)</label>
                  <input 
                    type="text" 
                    placeholder="+91 9876543210"
                    value={newRoleData.phoneNumber}
                    onChange={(e) => setNewRoleData({...newRoleData, phoneNumber: e.target.value})}
                    style={{ width: "100%", padding: "10px", border: "1px solid #b5bda0", backgroundColor: "#fff", outline: "none", borderRadius: "4px" }} 
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b6b6b", marginBottom: "6px" }}>DEPARTMENT</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Computer Science"
                    value={newRoleData.department}
                    onChange={(e) => setNewRoleData({...newRoleData, department: e.target.value})}
                    style={{ width: "100%", padding: "10px", border: "1px solid #b5bda0", backgroundColor: "#fff", outline: "none", borderRadius: "4px" }} 
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b6b6b", marginBottom: "6px" }}>EMAIL</label>
                  <input 
                    type="email" 
                    value={newRoleData.email}
                    onChange={(e) => setNewRoleData({...newRoleData, email: e.target.value})}
                    style={{ width: "100%", padding: "10px", border: "1px solid #b5bda0", backgroundColor: "#fff", outline: "none", borderRadius: "4px" }} 
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b6b6b", marginBottom: "6px" }}>SELECT ROLE</label>
                  <select 
                    value={newRoleData.role}
                    onChange={(e) => setNewRoleData({...newRoleData, role: e.target.value})}
                    style={{ width: "100%", padding: "10px", border: "1px solid #b5bda0", backgroundColor: "#fff", outline: "none", cursor: "pointer", borderRadius: "4px" }}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Viewer">Viewer</option>
                    <option value="Editor">Editor</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "10px 24px", backgroundColor: "transparent", border: "1px solid #b5bda0", color: "#6b6b6b", fontWeight: 600, cursor: "pointer", borderRadius: "4px", transition: "all 0.2s" }}
                  onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = "#e0dcd3"; e.currentTarget.style.color = "#1a1a1a"}}
                  onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b6b6b"}}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddRoleClick}
                  style={{ padding: "10px 32px", backgroundColor: "#b5bda0", color: "#1a1a1a", border: "none", fontWeight: 600, cursor: "pointer", borderRadius: "4px", transition: "background 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#9ca386"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#b5bda0"}
                >
                  {modalMode === "add" ? "Add Role" : "Update Role"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      {isConfirmingAdd && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 10000,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            backgroundColor: "#f5f0e8", border: "2px solid #b5bda0", padding: "32px", maxWidth: "400px", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
          }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#1a1a1a", fontSize: "18px" }}>
              {modalMode === "add" ? "Are you sure you wanna add this role?" : "Are you sure you want to change this user's role?"}
            </h3>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px" }}>
              <button 
                onClick={handleConfirmAdd}
                style={{ padding: "8px 24px", backgroundColor: "#b5bda0", color: "#1a1a1a", border: "none", fontWeight: 600, cursor: "pointer" }}
              >
                Yes
              </button>
              <button 
                onClick={handleCancelAdd}
                style={{ padding: "8px 24px", backgroundColor: "transparent", color: "#1a1a1a", border: "1px solid #b5bda0", fontWeight: 600, cursor: "pointer" }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </div>
  );
}
