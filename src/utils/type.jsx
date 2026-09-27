export default function getUser() {
  const userName = localStorage.getItem("watchparty_name");
  if (userName) {
    return userName;
  } else {
    const userName = `Guest_${Math.floor(Math.random() * 1000)}`; //generates a random guest name.
    localStorage.setItem("watchparty_name", userName);
    return userName;
  }
}
