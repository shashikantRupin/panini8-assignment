export const navItems = () => {
  const token = sessionStorage.getItem("token");

  const items = [
    { id: 1, title: "Home", url: "/" },
    { id: 2, title: "Profile", url: "/profile" },
    { id: 3, title: "Blogs", url: "/blogs" },
  ];

  if (!token) {
    items.push({ id: 4, title: "Signup", url: "/signup" });
  }

  items.push({
    id: 5,
    title: token ? "Logout" : "Signin",
    url: token ? "/signin" : "/signin",
  });

  return items;
};
