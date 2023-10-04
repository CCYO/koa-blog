const CONS = {
  REDIR_QUERY: "from",
};

function redirForm(REDIR) {
  let searchParams = new URLSearchParams(location.search);
  if (!searchParams.size) {
    alert(`要去 => ${REDIR}`);
    location.href = REDIR;
  } else {
    let url = decodeURIComponent(searchParams.get(CONS.REDIR_QUERY));
    location.href = url;
  }
}

// export { redirForm }
export default redirForm;
