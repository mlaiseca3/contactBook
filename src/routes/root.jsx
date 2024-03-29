import { useEffect } from 'react';
import { 
	Outlet, 
	NavLink,
	// Link,
	useLoaderData,
	Form,
	redirect,
	useNavigation,
	useSubmit,
} from 'react-router-dom';
import { getContacts, createContact } from '../contacts';

// loader() provides data to route before it renders output
// a loader() lets a route "read" data
// instead of sending request to server to get data it redirects that request
// to the front end app using a <Link>
// loader() is called whenever the app send a get request
export async function loader({ request }) {
	const url = new URL(request.url);
	const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return { contacts, q};
}

// action() mutates data to route before it renders output 
// action() lets a route "write" data
// Actions are called whenever the app sends a non-get request
// ("post", "put", "patch", "delete") to your route. 
export async function action() {
  const contact = await createContact();
  return redirect(`/contacts/${contact.id}/edit`);
}


export default function Root() {
	// useLoaderData() This hook provides the value returned from your route loader.
	const { contacts, q } = useLoaderData();
	const navigation = useNavigation();
	const submit = useSubmit();

	const searching = 
		navigation.location && 
		new URLSearchParams(navigation.location.search).has('q');
	
	useEffect(() => {
		document.getElementById('q').value = q
	}, [q]);

  return (
    <>
      <div id="sidebar">
        <h1>React Router Contacts</h1>
        <div>
          <Form id="search-form" role="search">
            <input
              id="q"
							className={searching ? 'loading' : ''}
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="q"
							defaultValue={q}
							onChange={(event) => {
								const isFirstSearch = q == null;
								submit(event.currentTarget.form, {
									replace: !isFirstSearch,
								});
							}}
            />
            <div
              id="search-spinner"
              aria-hidden
              hidden={true}
            />
            <div
              className="sr-only"
              aria-live="polite"
            ></div>
          </Form>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
			<nav>
			{contacts.length ? (
				<ul>
				{contacts.map((contact) => (
					<li key={contact.id}>
					<NavLink to={`contacts/${contact.id}`}
						className={({ isActive, isPending }) =>
										isActive
											? "active"
											: isPending
											? "pending"
											: ""
									}
						>
						{contact.first || contact.last ? (
							<>
							{contact.first} {contact.last}
							</>
						) : (
							<i>No Name</i>
						)}{" "}
						{contact.favorite && <span>★</span>}
					</NavLink>
					</li>
				))}
				</ul>
			) : (
				<p>
				<i>No contacts</i>
				</p>
			)}

			</nav>
      </div>
      <div 
				id="detail"
				className={
					navigation.state === "loading" ? "loading" : ""
				}
			>
				<Outlet />
			</div>
    </>
  );
}
