(function () {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  form.noValidate = true;

  const status = form.querySelector("#contact-status");
  const submitButton = form.querySelector("#contact-submit");
  const loadedAt = form.querySelector("#form-loaded-at");
  const honeypot = form.querySelector('input[name="website_url"]');
  const fields = [
    {
      el: form.querySelector("#contact-name"),
      error: form.querySelector("#contact-name-error"),
      message: "Please enter your full name.",
    },
    {
      el: form.querySelector("#contact-email"),
      error: form.querySelector("#contact-email-error"),
      message: "Please enter a valid email address.",
    },
    {
      el: form.querySelector("#contact-subject"),
      error: form.querySelector("#contact-subject-error"),
      message: "Please enter a subject.",
    },
    {
      el: form.querySelector("#contact-message"),
      error: form.querySelector("#contact-message-error"),
      message: "Please enter a message with at least 10 characters.",
    },
  ];

  if (loadedAt) {
    loadedAt.value = String(Date.now());
  }

  const setStatus = (message, type) => {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", type === "error");
    status.classList.toggle("is-success", type === "success");
  };

  const setLoading = (isLoading) => {
    if (!submitButton) return;
    submitButton.disabled = isLoading;
    submitButton.classList.toggle("is-loading", isLoading);
    submitButton.setAttribute("aria-busy", String(isLoading));
  };

  const getFieldError = (field) => {
    const input = field.el;
    const value = input.value.trim();

    if (!value) return field.message;
    if (input.type === "email" && !input.validity.valid) return field.message;
    if (input.minLength > 0 && value.length < input.minLength) return field.message;
    return "";
  };

  const validate = () => {
    let firstInvalid = null;

    fields.forEach((field) => {
      if (!field.el || !field.error) return;
      const message = getFieldError(field);
      field.error.textContent = message;
      field.el.setAttribute("aria-invalid", message ? "true" : "false");
      if (message && !firstInvalid) firstInvalid = field.el;
    });

    if (honeypot && honeypot.value.trim()) {
      setStatus("Your message could not be sent. Please try again.", "error");
      return false;
    }

    if (loadedAt && Date.now() - Number(loadedAt.value) < 2500) {
      setStatus("Please wait a moment before sending your message.", "error");
      return false;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      setStatus("Please fix the highlighted fields before sending.", "error");
      return false;
    }

    setStatus("", "");
    return true;
  };

  fields.forEach((field) => {
    if (!field.el) return;
    field.el.addEventListener("input", () => {
      if (field.el.getAttribute("aria-invalid") === "true") validate();
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validate()) return;

    const action = form.getAttribute("action");
    if (!action) {
      setStatus("The contact form is not configured correctly.", "error");
      return;
    }

    const formData = new FormData(form);

    setLoading(true);
    setStatus("Sending your message...", "");

    try {
      const response = await fetch(action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false || result.success === "false") {
        throw new Error("Formspree returned an error.");
      }

      setStatus("Message sent successfully. Redirecting...", "success");
      form.reset();
      window.setTimeout(() => {
        window.location.assign("/thank-you.html");
      }, 900);
    } catch (error) {
      setLoading(false);
      setStatus("We could not send your message right now. Please try again later.", "error");
    }
  });
})();
