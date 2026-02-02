// import { useState, useEffect } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";

// const useFetchEmails = () => {
//   const [emails, setEmails] = useState([]);

//   useEffect(() => {
//     const fetchEmails = async () => {
//       try {
//         const response = await axios.get(
//           "https://devdemo.softtrails.net/users/email_users",
//           {
//             headers: {
//               Authorization: `Bearer ${sessionStorage.getItem("token")}`,
//             },
//           }
//         );
//         const emailsArray = response.data.users || [];
//         setEmails(emailsArray);
//       } catch (error) {
//         Swal.fire({
//           icon: "error",
//           title: "Error",
//           text: "Error fetching emails.",
//         });
//       }
//     };

//     fetchEmails();
//   }, []);

//   return emails;
// };
// export default useFetchEmails;

///////////////////////////////////
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const useFetchEmails = () => {
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await axios.get(
          "https://devdemo.softtrails.net/users/getusers",
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );

        if (response.data && Array.isArray(response.data.users)) {
          // ✅ Filter only active users
          const activeUsers = response.data.users.filter(
            (user) => user.user_status === "active"
          );

          // ✅ Format name + email for dropdown display
          const formatted = activeUsers.map((user) => ({
            value: user.user_id,
            label: `${user.first_name} ${user.last_name} — ${user.email}`,
          }));

          setEmails(formatted);
        } else {
          setEmails([]);
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error fetching user list.",
        });
      }
    };

    fetchEmails();
  }, []);

  return emails;
};
export default useFetchEmails;
