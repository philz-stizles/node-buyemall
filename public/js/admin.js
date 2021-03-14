// document.querySelector('#deleteProduct').addEventListener('click', () => {
//     console.log('deleted')
// })

deleteProduct = (element) => {
    const id = element.parentNode.querySelector('[name=productId]').value
    const csrfToken = element.parentNode.querySelector('[name=_csrf]').value
    const parentElement = element.closest('.card')

    fetch(`http://localhost:5000/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrfToken // This will work because csrf will check every where for this 
            // both the body and the header so we pass in the header unlike with POST from the body
        }
    })
    .then(response => response.json())
    .then(data => {
        parentElement.parentNode.removeChild(parentElement)
    })
    .catch(error => {
        console.log(error)
    })
}