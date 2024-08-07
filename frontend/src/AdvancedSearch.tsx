import axios, {AxiosResponse} from 'axios';
import {useContext, useEffect, useState} from "react";
import Layout from "./Layout.tsx";
import {FormInputType, roleType, UserContext} from "./App.tsx";
import "./CSS/AdvancedSearch.css";
import { useNavigate} from "react-router-dom";

type suchType = {
    criteria: string;
    operator: string;
    userdata: keyof FormInputType;
};

function AdvancedSearch() {
    const [suche, setSuche] = useState<suchType>({
        criteria: "",
        operator: "=",
        userdata: "nachname"
    });
    const [isNumber, setIsNumber] = useState<boolean>(false);
    const [mitarbeiter, setMitarbeiter] = useState<FormInputType[]>([]);
    const [gefilterteMitarbeiter, setGefilterteMitarbeiter] = useState<FormInputType[]>([]);
    const {setUserId} = useContext(UserContext)
    const [rolle ] = useState<roleType>(roleType.USER);
    useEffect(() => {
        axios.get('/api/user/mitarbeiter', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("jwt")}`
            }
        })
            .then((response: AxiosResponse<FormInputType[]>) => {
                setMitarbeiter(response.data);
                setGefilterteMitarbeiter(response.data);
            })
            .catch(error => {
                console.error('Error backend', error);
            });
    }, []);

    const handleNumChange = (value: keyof FormInputType) => {
        setIsNumber(value === "stock" || value === "pultnummer");
    };


    const handleChange = (name: string, value: string) => {
        setSuche({
            ...suche,
            [name]: value
        });
    };

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const { criteria, operator, userdata } = suche;
        const gefiltert = mitarbeiter.filter(m => {
            let data = m[userdata];

            if (data == null) {

                return false;
            }

            if (isNumber && !isNaN(Number(data))) {
                data = Number(data);
            } else {
                data = data.toString().toLowerCase();
            }
            const criteriaLower = criteria.toLowerCase();

            switch (operator) {
                case '=':
                    return data === criteriaLower;
                case '≠':
                    return data !== criteriaLower;
                case '>':
                    return data > criteriaLower;
                case '>=':
                    return data >= criteriaLower;
                case '<':
                    return data < criteriaLower;
                case '<=':
                    return data <= criteriaLower;
                default:
                    return false;
            }
        });
        setGefilterteMitarbeiter(gefiltert);
    };



    const navigate = useNavigate();

    const AdressbuchBildClick = (userId: string) => {
        setUserId(userId);
        navigate("/InfoOverview");
    };
    const formatBase64Image = (data: string): string => {
        if (data && !data.startsWith('data:image')) {
            return `data:image/png;base64,${data}`;
        }
        return data;
    };

    const suchenav = (event: React.ChangeEvent<HTMLSelectElement>) => {
        navigate(event.target.value);
    };

    return (
        <div>
            <Layout />
            <div id={"DivCanvasDel"}></div>
            <div id="suchleistencanvas" className={"shadow-and-radius"}>
                <form onSubmit={handleSubmit}>
                    <input
                        name="criteria"
                        className={"shadow-and-radius"}
                        id="suchleiste"
                        placeholder="Suchkriterium..."
                        type="search"
                        onChange={(e) => {
                            e.preventDefault();
                            handleChange(e.target.name, e.target.value);
                        }}
                    />
                    <select
                        id="operator"
                        name="operator"
                        className={"shadow-and-radius"}
                        onChange={(e) => {
                            e.preventDefault();
                            handleChange(e.target.name, e.target.value);
                        }}
                    >
                        <option value="=">=</option>
                        {isNumber && <option value=">">{">"}</option>}
                        {isNumber && <option value=">=">{">="}</option>}
                        {isNumber && <option value="<">{"<"}</option>}
                        {isNumber && <option value="<=">{"<="}</option>}
                        <option value="≠">≠</option>
                    </select>
                    <select
                        className={"shadow-and-radius"}
                        id="userdata"
                        name="userdata"
                        onChange={(e) => {
                            e.preventDefault();
                            handleNumChange(e.target.value as keyof FormInputType);
                            handleChange(e.target.name, e.target.value);
                        }}
                    >
                        <option value="nachname">Nachname</option>
                        <option value="name">Vorname</option>
                        <option value="userid">UserID</option>
                        <option value="geschlecht">Geschlecht</option>
                        <option value="telefonnummer">Telefon</option>
                        <option value="ort">Ort</option>
                        <option value="strasse">Strasse</option>
                        <option value="stock">Stock</option>
                        <option value="pultnummer">Pultnummer</option>
                        <option value="gebaeude">Gebäude</option>
                    </select>
                    <button id={"suchenButtonErweitert"} className={"btn-layout shadow-and-radius"} type="submit">Suchen</button>
                </form>
                <select onChange={suchenav} id="optionset-list" className="btn-layout shadow-and-radius">
                    <option>Visitenkarte</option>
                    <option value="/MitarbeiterlistAdvanced">Liste</option>
                </select>

                <div id="treffertext" className={"shadow-and-radius"}>Treffer: {gefilterteMitarbeiter.length}</div>
            </div>
            <div id="datencanvas">
                {gefilterteMitarbeiter.map((mitarbeiter, index) => (
                    <div className="canvas-container flex-container shadow-and-radius" key={index}>
                        <div id={"mdatentext"} className={"shadow-and-radius"} onClick={() => {AdressbuchBildClick(mitarbeiter.userid)}}>
                            {mitarbeiter.bildUrl && <img  src={formatBase64Image(mitarbeiter.bildUrl)} className={"shadow-and-radius"} id="BildAdressbuch" alt="BILD"/>}
                            <p> <b>{mitarbeiter.name} {mitarbeiter.nachname} <i>({mitarbeiter.userid}) </i> </b></p>
                            <p>Tele: {mitarbeiter.telefonnummer}</p>
                            <p>Ort: {mitarbeiter.ort}</p>
                            <p>Geschlecht: {mitarbeiter.geschlecht}</p>
                            {rolle == roleType.ADMIN && <p>Rolle: {mitarbeiter.rolle}</p>}


                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdvancedSearch;
