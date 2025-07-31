// Webhook URL pour n8n
const WEBHOOK_URL = 'https://n8n.apprendrelenocode.com/webhook/a4cc2f04-be05-47e4-a0fe-ffe5e4109a9f';

// Variables globales qui seront initialisées après le chargement du DOM
let chatMessages, chatForm, userInput;

// Fonction pour ajouter un message au chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // S'assurer que le contenu est bien du texte et le nettoyer
    const textContent = String(content).trim();
    
    // Utiliser textContent pour éviter l'injection HTML non désirée
    messageContent.textContent = textContent;
    
    messageDiv.appendChild(messageContent);
    
    // S'assurer que chatMessages existe avant d'ajouter
    if (chatMessages) {
        chatMessages.appendChild(messageDiv);
        
        // Scroll vers le bas avec un petit délai pour assurer le rendu
        requestAnimationFrame(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    } else {
        console.error('chatMessages element not found!');
    }
}

// Fonction pour afficher l'indicateur de frappe
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing-message';
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}

// Fonction pour envoyer une question au webhook
async function sendQuestion(question) {
    try {
        // Désactiver le formulaire pendant l'envoi
        userInput.disabled = true;
        chatForm.querySelector('button').disabled = true;
        
        // Afficher l'indicateur de frappe
        const typingIndicator = showTypingIndicator();
        
        // Préparer les données
        const requestData = {
            chat_user: question
        };
        
        console.log('Envoi au webhook:', requestData);
        
        // Envoyer la requête au webhook
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        // Supprimer l'indicateur de frappe
        typingIndicator.remove();
        
        if (response.ok) {
            // Récupérer la réponse en tant que texte
            const responseText = await response.text();
            console.log('Réponse brute reçue:', responseText);
            
            // Extraire le texte de l'iframe si présent
            let cleanText = responseText;
            
            // Si la réponse contient un iframe avec srcdoc
            const srcdocMatch = responseText.match(/srcdoc="([^"]+)"/);
            if (srcdocMatch && srcdocMatch[1]) {
                // Extraire et décoder le contenu du srcdoc
                cleanText = srcdocMatch[1]
                    .replace(/&quot;/g, '"')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&#39;/g, "'");
            }
            
            // Nettoyer tout HTML restant
            cleanText = cleanText.replace(/<[^>]*>/g, '').trim();
            
            console.log('Texte nettoyé:', cleanText);
            
            // Afficher le texte nettoyé
            addMessage(cleanText);
        } else {
            console.error('Erreur HTTP:', response.status);
            const errorText = await response.text();
            console.error('Détails de l\'erreur:', errorText);
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
    } catch (error) {
        console.error('Erreur lors de l\'envoi de la question:', error);
        
        // Supprimer l'indicateur de frappe s'il existe encore
        const typingMessage = chatMessages.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
        
        // Afficher un message d'erreur
        addMessage(`
            <p>Désolé, une erreur s'est produite lors de la communication avec notre assistant.</p>
            <p style="font-size: 0.9em; color: #666;">Veuillez réessayer dans quelques instants.</p>
        `);
    } finally {
        // Réactiver le formulaire
        userInput.disabled = false;
        chatForm.querySelector('button').disabled = false;
        userInput.focus();
    }
}

// Variable pour éviter les doubles soumissions
let isSubmitting = false;

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les références aux éléments
    chatMessages = document.getElementById('chat-messages');
    chatForm = document.getElementById('chat-form');
    userInput = document.getElementById('user-input');
    
    // Vérifier que tous les éléments sont bien chargés
    if (!chatMessages || !chatForm || !userInput) {
        console.error('Éléments manquants:', {
            chatMessages: !!chatMessages,
            chatForm: !!chatForm,
            userInput: !!userInput
        });
        return;
    }
    
    // Gestionnaire de soumission du formulaire
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Éviter les doubles soumissions
        if (isSubmitting) return;
        
        const question = userInput.value.trim();
        if (!question) return;
        
        isSubmitting = true;
        
        // Ajouter la question de l'utilisateur
        addMessage(question, true);
        
        // Vider le champ de saisie
        userInput.value = '';
        
        // Envoyer la question
        await sendQuestion(question);
        
        // Réinitialiser le flag
        isSubmitting = false;
    });
    
    // Focus sur le champ de saisie
    userInput.focus();
});

