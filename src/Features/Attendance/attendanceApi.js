const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

function getAuthorizationHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
}

async function handleResponse(response) {
  let responseData = {};

  try {
    responseData = await response.json();
  } catch {
    responseData = {};
  }

  if (!response.ok) {
    throw new Error(
      responseData.message ||
        responseData.error ||
        "Unable to complete the request"
    );
  }

  return responseData;
}

export async function fetchAllAttendance() {
  const response = await fetch(
    `${API_BASE_URL}/attendance`,
    {
      method: "GET",
      headers: getAuthorizationHeaders(),
    }
  );

  return handleResponse(response);
}

export async function fetchAttendanceBySession(
  sessionId
) {
  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  const response = await fetch(
    `${API_BASE_URL}/attendance/session/${sessionId}`,
    {
      method: "GET",
      headers: getAuthorizationHeaders(),
    }
  );

  return handleResponse(response);
}

export async function fetchAttendanceByStudent(
  studentId
) {
  if (!studentId) {
    throw new Error("Student ID is required");
  }

  const response = await fetch(
    `${API_BASE_URL}/attendance/student/${studentId}`,
    {
      method: "GET",
      headers: getAuthorizationHeaders(),
    }
  );

  return handleResponse(response);
}